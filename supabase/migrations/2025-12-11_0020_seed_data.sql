-- Transporters
insert into public.transporters (transporter_name, code, email, mobile, is_active)
values ('Global Logistics Inc.', 'TSP01', 'ops@globallog.com', '9876500001', 'Y')
on conflict (code) do nothing;

insert into public.transporters (transporter_name, code, email, mobile, is_active)
values ('Express Transport Co.', 'TSP02', 'ops@exptrans.com', '9876500002', 'Y')
on conflict (code) do nothing;

-- Vehicle Types
insert into public.vehicle_types (type_name, length_m, breadth_m, height_m, weight_load_capacity_tons, volume_load_capacity_cum)
values ('32XL', 9.8, 2.4, 2.7, 16.0, 63.5)
on conflict (type_name) do nothing;

insert into public.vehicle_types (type_name, length_m, breadth_m, height_m, weight_load_capacity_tons, volume_load_capacity_cum)
values ('20FT', 6.1, 2.4, 2.6, 10.0, 38.0)
on conflict (type_name) do nothing;

-- Vehicles
insert into public.vehicles (vehicle_number, vehicle_type, tracking_asset, is_dedicated, location_code, integration_code, status)
values ('MH12AB1234', '32XL', 'GPS001', 'N', 'MUM-001', 'ERP-VEH-001', 'Active')
on conflict (vehicle_number) where (status='Active') do nothing;

insert into public.vehicles (vehicle_number, vehicle_type, tracking_asset, is_dedicated, location_code, integration_code, status)
values ('DL04GH3456', '20FT', 'GPS003', 'N', 'DEL-001', 'ERP-VEH-002', 'Active')
on conflict (vehicle_number) where (status='Active') do nothing;

-- Drivers
insert into public.drivers (name, mobile_number, is_dedicated, license_number, license_expiry_date, status, consent_status)
values ('Ramesh Kumar', '9876543210', 'Y', 'MH1220200012345', '2035-01-14', 'Active', 'Approved')
on conflict (mobile_number) do nothing;

insert into public.drivers (name, mobile_number, is_dedicated, license_number, license_expiry_date, status, consent_status)
values ('Suresh Yadav', '9876543211', 'N', 'KA0120190054321', '2034-05-19', 'Active', 'Pending')
on conflict (mobile_number) do nothing;

-- Locations
insert into public.locations (address, location_name, sim_radius, gps_radius, latitude, longitude, location_type, city_name, pincode, state_name, status)
values ('Mumbai Hub, Maharashtra', 'Mumbai Hub', 5000, 500, 19.0760, 72.8777, 'Node', 'Mumbai', '400001', 'Maharashtra', 'Active')
on conflict (location_name) do nothing;

insert into public.locations (address, location_name, sim_radius, gps_radius, latitude, longitude, location_type, city_name, pincode, state_name, status)
values ('Delhi Warehouse, Delhi', 'Delhi Warehouse', 5000, 500, 28.6139, 77.2090, 'Node', 'Delhi', '110001', 'Delhi', 'Active')
on conflict (location_name) do nothing;

-- Lanes
insert into public.lanes (lane_type, mode_of_transport, origin_name, destination_name, lane_name, lane_code, distance_km, lane_status)
values ('City to City', 'Road', 'Mumbai Hub', 'Delhi Warehouse', 'Mumbai-Delhi Express', 'LN001', 1400, 'Active')
on conflict (lane_code) do nothing;

-- Shipments
insert into public.shipments (name, is_bulk, code, description, sku_code, packaging, units, weight, weight_uom, volume, volume_uom, status)
values ('Electronics Box', 'N', 'ELEC-001', 'Standard electronics packaging box', 'SKU-ELEC-001', 'Box', 'Pieces', 5, 'kg', 0.06, 'm³', 'Active')
on conflict (code) do nothing;

insert into public.shipments (name, is_bulk, code, description, sku_code, packaging, units, weight, weight_uom, volume, volume_uom, status)
values ('Bulk Cement', 'Y', 'BULK-CEM-001', 'Bulk cement for construction', 'SKU-CEM-001', 'Bulk', 'Tons', 1000, 'kg', 1, 'm³', 'Active')
on conflict (code) do nothing;

-- Tracking Assets
insert into public.tracking_assets (display_name, asset_type, asset_id, driver_id, status)
values ('Driver SIM Ramesh', 'SIM', 'SIM9876543210', (select id from public.drivers where mobile_number='9876543210'), 'Active')
on conflict (asset_id) do nothing;

insert into public.tracking_assets (display_name, asset_type, asset_id, vehicle_id, status)
values ('Vehicle GPS MH12', 'GPS', 'GPS001', (select id from public.vehicles where vehicle_number='MH12AB1234'), 'Active')
on conflict (asset_id) do nothing;

-- Serviceability
insert into public.serviceability_lanes (lane_code, freight_type_code, serviceability_mode, transporter_code, vehicle_type_code, standard_tat, express_tat)
values ('LN001', 'FTL', 'Surface', 'TSP01', '32XL', 48, 36)
on conflict (lane_code) do nothing;
