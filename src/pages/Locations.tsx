import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listLocations, deleteLocation } from "@/services/locationService";
import { toast } from "sonner";

interface LocationRow {
  id: string;
  locationName: string;
  locationType: string;
  cityName: string;
  stateName: string;
  pincode: string;
  simRadius: number;
  gpsRadius: number;
  latitude: number | null;
  longitude: number | null;
  status: string;
}

const columns: Column<LocationRow>[] = [
  { key: "locationName", header: "Location Name" },
  { key: "locationType", header: "Type" },
  { key: "cityName", header: "City" },
  { key: "stateName", header: "State" },
  { key: "pincode", header: "Pincode" },
  { key: "simRadius", header: "SIM Radius (m)" },
  { key: "gpsRadius", header: "GPS Radius (m)" },
  {
    key: "status",
    header: "Status",
    render: (item) => <Badge variant={item.status === "Active" ? "default" : "secondary"}>{item.status}</Badge>,
  },
];

const Locations = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["locations"], queryFn: listLocations });

  const handleDelete = async (item: LocationRow) => {
    try {
      await deleteLocation(item.id);
      toast.success("Location deleted");
      queryClient.invalidateQueries({ queryKey: ["locations"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const rows: LocationRow[] = (data || []).map((l) => ({
    id: l.id,
    locationName: l.locationName,
    locationType: l.locationType,
    cityName: l.cityName,
    stateName: l.stateName,
    pincode: l.pincode,
    simRadius: l.simRadius,
    gpsRadius: l.gpsRadius,
    latitude: l.latitude,
    longitude: l.longitude,
    status: l.status,
  }));

  return (
    <DashboardLayout>
      <DataTable
        title="Locations"
        data={rows}
        columns={columns}
        searchKey="locationName"
        addUrl="/locations/add"
        viewUrl={(id) => `/locations/view/${id}`}
        editUrl={(id) => `/locations/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Locations;
