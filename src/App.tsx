import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Dashboard from "./pages/Dashboard";
import VehicleMaster from "./pages/VehicleMaster";
import Lanes from "./pages/Lanes";
import PartnerMaster from "./pages/PartnerMaster";
import Driver from "./pages/Driver";
import TrackingAsset from "./pages/TrackingAsset";
import Users from "./pages/Users";
import Trips from "./pages/Trips";
import Shipments from "./pages/Shipments";
import LiveLocation from "./pages/LiveLocation";
import Settings from "./pages/Settings";

// Form Pages
import VehicleFormPage from "./pages/vehicles/VehicleFormPage";
import LaneFormPage from "./pages/lanes/LaneFormPage";
import PartnerFormPage from "./pages/partners/PartnerFormPage";
import DriverFormPage from "./pages/drivers/DriverFormPage";
import TrackingAssetFormPage from "./pages/tracking-assets/TrackingAssetFormPage";
import UserFormPage from "./pages/users/UserFormPage";
import TripFormPage from "./pages/trips/TripFormPage";
import TripViewPage from "./pages/trips/TripViewPage";
import ShipmentFormPage from "./pages/shipments/ShipmentFormPage";
import Locations from "./pages/Locations";
import LocationFormPage from "./pages/locations/LocationFormPage";
import TransporterMaster from "./pages/TransporterMaster";
import TransporterFormPage from "./pages/transporters/TransporterFormPage";
import VehicleTypeMaster from "./pages/VehicleTypeMaster";
import VehicleTypeFormPage from "./pages/vehicle-types/VehicleTypeFormPage";
import ServiceabilityMaster from "./pages/ServiceabilityMaster";
import ServiceabilityFormPage from "./pages/serviceability/ServiceabilityFormPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Vehicle Master Routes */}
          <Route path="/vehicle-master" element={<VehicleMaster />} />
          <Route path="/vehicle-master/add" element={<VehicleFormPage mode="add" />} />
          <Route path="/vehicle-master/view/:id" element={<VehicleFormPage mode="view" />} />
          <Route path="/vehicle-master/edit/:id" element={<VehicleFormPage mode="edit" />} />
          
          {/* Lanes Routes */}
          <Route path="/lanes" element={<Lanes />} />
          <Route path="/lanes/add" element={<LaneFormPage mode="add" />} />
          <Route path="/lanes/view/:id" element={<LaneFormPage mode="view" />} />
          <Route path="/lanes/edit/:id" element={<LaneFormPage mode="edit" />} />
          
          {/* Partner Master Routes */}
          <Route path="/partner-master" element={<PartnerMaster />} />
          <Route path="/partner-master/add" element={<PartnerFormPage mode="add" />} />
          <Route path="/partner-master/view/:id" element={<PartnerFormPage mode="view" />} />
          <Route path="/partner-master/edit/:id" element={<PartnerFormPage mode="edit" />} />
          
          {/* Driver Routes */}
          <Route path="/driver" element={<Driver />} />
          <Route path="/driver/add" element={<DriverFormPage mode="add" />} />
          <Route path="/driver/view/:id" element={<DriverFormPage mode="view" />} />
          <Route path="/driver/edit/:id" element={<DriverFormPage mode="edit" />} />
          
          {/* Tracking Asset Routes */}
          <Route path="/tracking-asset" element={<TrackingAsset />} />
          <Route path="/tracking-asset/add" element={<TrackingAssetFormPage mode="add" />} />
          <Route path="/tracking-asset/view/:id" element={<TrackingAssetFormPage mode="view" />} />
          <Route path="/tracking-asset/edit/:id" element={<TrackingAssetFormPage mode="edit" />} />
          
          {/* Users Routes */}
          <Route path="/users" element={<Users />} />
          <Route path="/users/add" element={<UserFormPage mode="add" />} />
          <Route path="/users/view/:id" element={<UserFormPage mode="view" />} />
          <Route path="/users/edit/:id" element={<UserFormPage mode="edit" />} />
          
          {/* Trips Routes */}
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/add" element={<TripFormPage mode="add" />} />
          <Route path="/trips/view/:id" element={<TripViewPage />} />
          <Route path="/trips/edit/:id" element={<TripFormPage mode="edit" />} />
          
          {/* Shipments Routes */}
          <Route path="/shipments" element={<Shipments />} />
          <Route path="/shipments/add" element={<ShipmentFormPage mode="add" />} />
          <Route path="/shipments/view/:id" element={<ShipmentFormPage mode="view" />} />
          <Route path="/shipments/edit/:id" element={<ShipmentFormPage mode="edit" />} />
          
          {/* Live Location */}
          <Route path="/live-location" element={<LiveLocation />} />

          {/* Locations Routes */}
          <Route path="/locations" element={<Locations />} />
          <Route path="/locations/add" element={<LocationFormPage mode="add" />} />
          <Route path="/locations/view/:id" element={<LocationFormPage mode="view" />} />
          <Route path="/locations/edit/:id" element={<LocationFormPage mode="edit" />} />

          {/* Transporters Routes */}
          <Route path="/transporters" element={<TransporterMaster />} />
          <Route path="/transporters/add" element={<TransporterFormPage mode="add" />} />
          <Route path="/transporters/view/:id" element={<TransporterFormPage mode="view" />} />
          <Route path="/transporters/edit/:id" element={<TransporterFormPage mode="edit" />} />

          {/* Vehicle Types Routes */}
          <Route path="/vehicle-types" element={<VehicleTypeMaster />} />
          <Route path="/vehicle-types/add" element={<VehicleTypeFormPage mode="add" />} />
          <Route path="/vehicle-types/view/:id" element={<VehicleTypeFormPage mode="view" />} />
          <Route path="/vehicle-types/edit/:id" element={<VehicleTypeFormPage mode="edit" />} />

          {/* Serviceability Routes */}
          <Route path="/serviceability" element={<ServiceabilityMaster />} />
          <Route path="/serviceability/add" element={<ServiceabilityFormPage mode="add" />} />
          <Route path="/serviceability/view/:id" element={<ServiceabilityFormPage mode="view" />} />
          <Route path="/serviceability/edit/:id" element={<ServiceabilityFormPage mode="edit" />} />
          
          {/* Settings */}
          <Route path="/settings" element={<Settings />} />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
