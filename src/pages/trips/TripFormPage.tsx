import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Form } from "@/components/ui/form";
import { tripSchema, TripFormData } from "@/lib/schemas";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, ArrowRight, Package } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listLanes } from "@/services/laneService";
import { listVehicles } from "@/services/vehicleService";
import { listDrivers } from "@/services/driverService";
import { listShipments } from "@/services/shipmentService";
import { createTrip, mapShipmentsToTrip } from "@/services/tripService";
import { Checkbox } from "@/components/ui/checkbox";
import { getToken, isExpired } from "@/services/tokenService";
import { upsertConsentForDriver } from "@/services/consentService";
import { RefreshCcw } from "lucide-react";

interface TripFormPageProps {
  mode: "add" | "view" | "edit";
}

const transporters = ["Global Logistics Inc.", "Express Transport Co.", "Swift Carriers Ltd.", "Prime Freight Services"];

// Mock existing data for edit/view
const mockTrips: Record<string, TripFormData & { shipmentIds?: string[] }> = {
  "1": { tripId: "TRP001", laneId: "LN001", vehicle: "MH12AB1234", driver: "Ramesh Kumar", transporter: "Global Logistics Inc.", startDate: "2024-01-15", startTime: "09:00", estimatedArrival: "2024-01-17", status: "In Transit", shipmentIds: ["SHP001", "SHP003"] },
  "2": { tripId: "TRP002", laneId: "LN002", vehicle: "TN07EF9012", driver: "Suresh Yadav", transporter: "Express Transport Co.", startDate: "2024-01-14", startTime: "08:00", estimatedArrival: "2024-01-15", status: "Completed", shipmentIds: ["SHP002"] },
};

const TripFormPage = ({ mode }: TripFormPageProps) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isReadOnly = mode === "view";
  const queryClient = useQueryClient();
  const { data: lanesData } = useQuery({ queryKey: ["lanes"], queryFn: listLanes });
  const { data: vehiclesData } = useQuery({ queryKey: ["vehicles"], queryFn: listVehicles });
  const { data: driversData } = useQuery({ queryKey: ["drivers"], queryFn: listDrivers });
  const { data: shipmentsData } = useQuery({ queryKey: ["shipments"], queryFn: listShipments });

  const existingData = id ? mockTrips[id] : undefined;
  const [selectedShipments, setSelectedShipments] = useState<string[]>(existingData?.shipmentIds || []);

  const form = useForm<TripFormData>({
    resolver: zodResolver(tripSchema),
    defaultValues: existingData || {
      tripId: "",
      laneId: "",
      vehicle: "",
      driver: "",
      transporter: "",
      startDate: "",
      startTime: "",
      estimatedArrival: "",
      trackingType: "SIM",
    },
  });

  const selectedLaneId = form.watch("laneId");
  const selectedLane = (lanesData || []).find(l => l.id === selectedLaneId);
  const selectedDriverMobile = form.watch("driver");
  const [consentStatus, setConsentStatus] = useState<string>("");
  const [consentChecking, setConsentChecking] = useState(false);
  const [provisioning, setProvisioning] = useState(false);
  const [refreshingConsent, setRefreshingConsent] = useState(false);

  useEffect(() => {
    setConsentStatus("");
    if (!selectedDriverMobile || selectedDriverMobile.length !== 10) return;
    const drv = (driversData || []).find(d => d.mobileNumber === selectedDriverMobile);
    if (drv) setConsentStatus(drv.consentStatus || "");
  }, [selectedDriverMobile, driversData]);

  useEffect(() => {
    if (consentStatus !== 'Pending') return;
    const drv = (driversData || []).find(d => d.mobileNumber === selectedDriverMobile);
    if (!drv) return;
    const timer = setInterval(async () => {
      try {
        const { data } = await (await import('@/lib/supabaseClient')).supabase
          .from('consents')
          .select('status')
          .eq('driver_id', drv.id)
          .limit(1);
        if (data && data.length) {
          const s = data[0].status as string;
          setConsentStatus(s);
        }
      } catch {}
    }, 60000);
    return () => clearInterval(timer);
  }, [consentStatus, selectedDriverMobile, driversData]);

  const handleShipmentToggle = (shipmentId: string) => {
    if (isReadOnly) return;
    setSelectedShipments(prev => 
      prev.includes(shipmentId) 
        ? prev.filter(id => id !== shipmentId)
        : [...prev, shipmentId]
    );
  };

  const onSubmit = async (data: TripFormData) => {
    try {
      if (data.trackingType === 'SIM') {
        if (consentStatus === 'DENIED') {
          toast.error('SIM consent denied');
          return;
        }
        if (consentStatus !== 'ALLOWED') {
          toast.warning('Consent not verified; proceeding');
        }
      }
      await createTrip({
        tripId: data.tripId,
        laneId: data.laneId,
        vehicleNumber: data.vehicle,
        driverName: data.driver,
        driverNumber: data.driver,
        consigneeName: selectedLane ? selectedLane.destinationName : "",
        transporterName: data.transporter || "",
        trackingType: data.trackingType,
        isTracked: true,
      });
      if (selectedShipments.length) {
        await mapShipmentsToTrip(data.tripId, selectedShipments.map(id => ({
          shipmentId: id,
          pickupPointCode: selectedLane ? selectedLane.originName : "",
          dropPointCode: selectedLane ? selectedLane.destinationName : "",
          consigneeCode: "",
          orderId: `${data.tripId}-${id}`,
        })));
      }
      queryClient.invalidateQueries({ queryKey: ["trips"] });
      toast.success("Trip created");
      navigate("/trips");
    } catch (e: any) {
      toast.error(e.message || "Trip creation failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Trip" backUrl="/trips" mode={mode}>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="tripId">Trip ID *</Label>
                <Input
                  id="tripId"
                  {...form.register("tripId")}
                  disabled={isReadOnly || mode === "edit"}
                  placeholder="Enter trip ID"
                />
                {form.formState.errors.tripId && (
                  <p className="text-sm text-destructive">{form.formState.errors.tripId.message}</p>
                )}
              </div>

              
            </div>

            {/* Lane Selection */}
            <div className="space-y-2">
              <Label htmlFor="laneId">Select Lane *</Label>
              <Select
                disabled={isReadOnly}
                value={form.watch("laneId")}
                onValueChange={(value) => form.setValue("laneId", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a lane for this trip" />
                </SelectTrigger>
                <SelectContent>
                  {(lanesData || []).map((lane) => (
                    <SelectItem key={lane.id} value={lane.id}>
                      {lane.laneCode} - {lane.laneName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.laneId && (
                <p className="text-sm text-destructive">{form.formState.errors.laneId.message}</p>
              )}
            </div>

            {/* Show Origin/Destination from selected lane */}
            {selectedLane && (
              <Card className="bg-muted/50">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-primary" />
                      <div>
                        <p className="text-xs text-muted-foreground">Origin</p>
                        <p className="font-semibold">{selectedLane.originName}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-muted-foreground" />
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-destructive" />
                      <div>
                        <p className="text-xs text-muted-foreground">Destination</p>
                        <p className="font-semibold">{selectedLane.destinationName}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="vehicle">Vehicle *</Label>
                <Select
                  disabled={isReadOnly}
                  value={form.watch("vehicle")}
                  onValueChange={(value) => form.setValue("vehicle", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    {(vehiclesData || []).map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.vehicleNumber}>{vehicle.vehicleNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.vehicle && (
                  <p className="text-sm text-destructive">{form.formState.errors.vehicle.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="driver">Driver *</Label>
                <Select
                  disabled={isReadOnly}
                  value={form.watch("driver")}
                  onValueChange={(value) => form.setValue("driver", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {(driversData || []).map((driver) => (
                      <SelectItem key={driver.id} value={driver.mobileNumber}>{driver.name} • {driver.mobileNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.driver && (
                  <p className="text-sm text-destructive">{form.formState.errors.driver.message}</p>
                )}
                {!isReadOnly && selectedDriverMobile && (
                  <p className="text-xs mt-1">
                    Consent: {consentChecking ? 'Checking…' : consentStatus === 'ALLOWED' ? 'ALLOWED' : consentStatus === 'TOKEN_EXPIRED' ? 'Token expired, refresh required' : consentStatus || 'UNKNOWN'}
                  </p>
                )}
                {!isReadOnly && consentStatus === 'Pending' && (
                  <Button type="button" variant="ghost" size="sm" className="mt-1" disabled={refreshingConsent} onClick={async () => {
                    setRefreshingConsent(true);
                    try {
                      const drv = (driversData || []).find(d => d.mobileNumber === selectedDriverMobile);
                      if (!drv) return;
                      const { data } = await (await import('@/lib/supabaseClient')).supabase
                        .from('consents')
                        .select('status')
                        .eq('driver_id', drv.id)
                        .limit(1);
                      if (data && data.length) {
                        const s = data[0].status as string;
                        setConsentStatus(s);
                      }
                    } catch (e: any) {
                      toast.error(e.message || 'Consent refresh failed');
                    } finally {
                      setRefreshingConsent(false);
                    }
                  }}>
                    <RefreshCcw className="w-4 h-4 mr-1" /> Refresh consent
                  </Button>
                )}
                {!isReadOnly && form.watch('trackingType') === 'SIM' && selectedDriverMobile && consentStatus === 'Pending' && (
                  <div className="mt-2">
                    <Button type="button" variant="secondary" size="sm" disabled={provisioning} onClick={async () => {
                      setProvisioning(true);
                      try {
                        const drv = (driversData || []).find(d => d.mobileNumber === selectedDriverMobile);
                        const nameParts = (drv?.name || 'Driver').split(' ');
                        const firstName = nameParts[0];
                        const lastName = nameParts.slice(1).join(' ');
                        const token = await getToken('telenity', 'auth');
                        if (!token || isExpired(token.expiresAt)) {
                          toast.error('Auth token expired; refresh and retry');
                          return;
                        }
                        try {
                          const res = await fetch('https://smarttrail.telenity.com/trail-rest/entities/import', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json', Authorization: `bearer ${token.token}` },
                            body: JSON.stringify({ entityImportList: [{ firstName, lastName, msisdn: `91${selectedDriverMobile}` }] }),
                          });
                          if (res.ok) toast.success('Consent SMS triggered');
                        } catch {}
                        if (drv) await upsertConsentForDriver(drv.id, `91${selectedDriverMobile}`, 'Pending', { importRequested: true });
                      } catch (e: any) {
                        toast.warning('Import call blocked; background job will handle.');
                      } finally {
                        setProvisioning(false);
                      }
                    }}>Trigger Import</Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="trackingType">Tracking Type *</Label>
                <Select disabled={isReadOnly} value={form.watch("trackingType") || "SIM"} onValueChange={(v) => form.setValue("trackingType", v as any)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tracking" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GPS">GPS</SelectItem>
                    <SelectItem value="SIM">SIM</SelectItem>
                    <SelectItem value="Manual">Manual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>


            <div className="space-y-2">
              <Label htmlFor="transporter">Transporter (Optional)</Label>
              <Select
                disabled={isReadOnly}
                value={form.watch("transporter") || "none"}
                onValueChange={(value) => form.setValue("transporter", value === "none" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transporter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {transporters.map((transporter) => (
                    <SelectItem key={transporter} value={transporter}>{transporter}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...form.register("startDate")}
                  disabled={isReadOnly}
                />
                {form.formState.errors.startDate && (
                  <p className="text-sm text-destructive">{form.formState.errors.startDate.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time *</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...form.register("startTime")}
                  disabled={isReadOnly}
                />
                {form.formState.errors.startTime && (
                  <p className="text-sm text-destructive">{form.formState.errors.startTime.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estimatedArrival">Estimated Arrival (Optional)</Label>
                <Input
                  id="estimatedArrival"
                  type="date"
                  {...form.register("estimatedArrival")}
                  disabled={isReadOnly}
                />
                {form.formState.errors.estimatedArrival && (
                  <p className="text-sm text-destructive">{form.formState.errors.estimatedArrival.message}</p>
                )}
              </div>
            </div>

            {/* Shipment Mapping Section */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Package className="w-4 h-4" />
                  Shipment Mapping (Optional)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(shipmentsData || []).map((shipment) => (
                    <div 
                      key={shipment.id} 
                      className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                        selectedShipments.includes(shipment.id) 
                          ? 'border-primary bg-primary/5' 
                          : 'border-border hover:bg-muted/50'
                      } ${isReadOnly ? 'cursor-default' : 'cursor-pointer'}`}
                      onClick={() => handleShipmentToggle(shipment.id)}
                    >
                      <div className="flex items-center gap-3">
                        <Checkbox 
                          checked={selectedShipments.includes(shipment.id)}
                          disabled={isReadOnly}
                          onCheckedChange={() => handleShipmentToggle(shipment.id)}
                        />
                        <div>
                          <p className="font-medium">{shipment.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {shipment.code} • {shipment.packaging} • {shipment.weight} {shipment.weightUoM}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedShipments.length > 0 && (
                  <p className="text-sm text-muted-foreground mt-3">
                    {selectedShipments.length} shipment(s) selected
                  </p>
                )}
              </CardContent>
            </Card>

            {!isReadOnly && (
              <div className="flex gap-4 pt-4">
                <Button type="submit" className="bg-primary hover:bg-primary/90">
                  {mode === "add" ? "Create Trip" : "Update Trip"}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate("/trips")}>
                  Cancel
                </Button>
              </div>
            )}
          </form>
        </Form>
      </FormPageLayout>
    </DashboardLayout>
  );
};

export default TripFormPage;
