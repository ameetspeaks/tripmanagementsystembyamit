import { supabase } from '@/lib/supabaseClient';
import { listVehicles } from '@/services/vehicleService';
import { listDrivers } from '@/services/driverService';
import { listLanes } from '@/services/laneService';

export async function validateTripInputs(payload: {
  tripId: string;
  laneId: string;
  vehicleNumber: string;
  driverNumber: string;
  driverName: string;
  consigneeName: string;
  transporterName: string;
  trackingType: 'GPS'|'SIM'|'Manual';
  isTracked: boolean;
}) {
  const tripExists = await supabase.from('trips').select('id').eq('trip_id', payload.tripId).maybeSingle();
  if (tripExists.data) throw new Error('Trip ID already exists');

  const lanes = await listLanes();
  const lane = lanes.find(l => l.id === payload.laneId);
  if (!lane) throw new Error('Invalid lane');

  const vehicles = await listVehicles();
  const vehicle = vehicles.find(v => v.vehicleNumber.toLowerCase() === payload.vehicleNumber.toLowerCase());
  if (!vehicle) throw new Error('Vehicle not found');

  const drivers = await listDrivers();
  const driver = drivers.find(d => d.mobileNumber === payload.driverNumber);
  if (!driver) throw new Error('Driver not found');

  if (payload.isTracked) {
    if (payload.trackingType === 'GPS') {
      const { data } = await supabase
        .from('tracking_assets')
        .select('id')
        .eq('asset_type', 'GPS')
        .eq('vehicle_id', vehicle.id)
        .limit(1);
      if (!data || data.length === 0) throw new Error('No GPS asset mapped to vehicle');
    }
    if (payload.trackingType === 'SIM') {
      if (driver.consentStatus !== 'Approved') throw new Error('Driver SIM consent not approved');
      const { data } = await supabase
        .from('tracking_assets')
        .select('id')
        .eq('asset_type', 'SIM')
        .eq('driver_id', driver.id)
        .limit(1);
      if (!data || data.length === 0) throw new Error('No SIM asset mapped to driver');
    }
  }
  return { lane, vehicle, driver };
}

export async function createTrip(payload: {
  tripId: string;
  laneId: string;
  vehicleNumber: string;
  driverName: string;
  driverNumber: string;
  consigneeName: string;
  transporterName: string;
  trackingType: 'GPS'|'SIM'|'Manual';
  isTracked: boolean;
}) {
  const { lane, vehicle, driver } = await validateTripInputs({
    tripId: payload.tripId,
    laneId: payload.laneId,
    vehicleNumber: payload.vehicleNumber,
    driverNumber: payload.driverNumber,
    driverName: payload.driverName,
    consigneeName: payload.consigneeName,
    transporterName: payload.transporterName,
    trackingType: payload.trackingType,
    isTracked: payload.isTracked,
  });

  const { error } = await supabase.from('trips').insert({
    trip_id: payload.tripId,
    lane_id: lane.id,
    origin_name: lane.originName,
    destination_name: lane.destinationName,
    vehicle_id: vehicle.id,
    driver_id: driver.id,
    transporter_id: null,
    vehicle_number: payload.vehicleNumber,
    driver_name: payload.driverName,
    driver_number: payload.driverNumber,
    consignee_name: payload.consigneeName,
    transporter_name: payload.transporterName,
    tracking_type: payload.trackingType,
    is_tracked: payload.isTracked,
    status: 'Created',
  });
  if (error) throw error;
}

export async function mapShipmentsToTrip(tripId: string, items: Array<{
  shipmentId: string;
  pickupPointCode: string;
  dropPointCode: string;
  consigneeCode: string;
  orderId: string;
  quantity?: number;
  weight?: number;
  volume?: number;
}>) {
  const { data: trip } = await supabase.from('trips').select('id,status').eq('trip_id', tripId).single();
  if (!trip) throw new Error('Trip not found');
  if (!items?.length) return;

  for (const it of items) {
    const { data: existing } = await supabase
      .from('trip_shipments_map')
      .select('id')
      .eq('pickup_point_code', it.pickupPointCode)
      .eq('drop_point_code', it.dropPointCode)
      .eq('consignee_code', it.consigneeCode)
      .eq('order_id', it.orderId)
      .limit(1);
    if (existing && existing.length) throw new Error('Shipment combination already exists');

    const { data: activeMap } = await supabase
      .from('trip_shipments_map')
      .select('trip_id')
      .eq('shipment_id', it.shipmentId)
      .limit(1);
    if (activeMap && activeMap.length) {
      const { data: activeTrip } = await supabase.from('trips').select('status').eq('id', activeMap[0].trip_id).single();
      if (activeTrip && ['Created','Ongoing'].includes(activeTrip.status)) throw new Error('Shipment already mapped to an active trip');
    }

    const { error } = await supabase.from('trip_shipments_map').insert({
      trip_id: trip.id,
      shipment_id: it.shipmentId,
      pickup_point_code: it.pickupPointCode,
      drop_point_code: it.dropPointCode,
      consignee_code: it.consigneeCode,
      order_id: it.orderId,
      quantity: it.quantity ?? null,
      weight: it.weight ?? null,
      volume: it.volume ?? null,
      status: 'Mapped',
    });
    if (error) throw error;
  }
}

export async function startTrip(tripId: string) {
  const { error } = await supabase.from('trips').update({ status: 'Ongoing', start_time: new Date().toISOString() }).eq('trip_id', tripId);
  if (error) throw error;
}

export async function completeTrip(tripId: string) {
  const { error } = await supabase.from('trips').update({ status: 'Completed', end_time: new Date().toISOString() }).eq('trip_id', tripId);
  if (error) throw error;
}

export async function closeTrip(tripId: string) {
  const { error } = await supabase.from('trips').update({ status: 'Closed' }).eq('trip_id', tripId);
  if (error) throw error;
}

export async function logTrackingPoint(tripId: string, point: { source: 'GPS'|'SIM'|'Manual'; lat: number; lng: number; accuracy?: number; eventTime: string; raw?: any }) {
  const { data: trip } = await supabase.from('trips').select('id').eq('trip_id', tripId).single();
  if (!trip) throw new Error('Trip not found');
  const { error } = await supabase.from('tracking_log').insert({ trip_id: trip.id, source: point.source, latitude: point.lat, longitude: point.lng, accuracy_m: point.accuracy ?? null, event_time: point.eventTime, raw: point.raw ?? null });
  if (error) throw error;
}

export async function getTripByTripId(tripId: string) {
  const { data, error } = await supabase
    .from('trips')
    .select('id, trip_id, status, origin_name, destination_name, vehicle_number, transporter_name, driver_name, driver_number, tracking_type, start_time, end_time')
    .eq('trip_id', tripId)
    .single();
  if (error) return null;
  return data;
}

export async function listTrackingLogs(tripRowId: string, limit = 20) {
  const { data, error } = await supabase
    .from('tracking_log')
    .select('id, source, latitude, longitude, accuracy_m, event_time, created_at')
    .eq('trip_id', tripRowId)
    .order('event_time', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data || [];
}

export async function createTripAlert(tripId: string, alert: { type: 'RouteDeviation'|'IdleDetention'|'Delay'|'ConsentRevoked'|'NoPing'; severity?: 'Low'|'Medium'|'High'; message?: string }) {
  const { data: trip } = await supabase.from('trips').select('id').eq('trip_id', tripId).single();
  if (!trip) throw new Error('Trip not found');
  const { error } = await supabase.from('trip_alerts').insert({ trip_id: trip.id, alert_type: alert.type, severity: alert.severity ?? 'Medium', message: alert.message ?? null });
  if (error) throw error;
}
