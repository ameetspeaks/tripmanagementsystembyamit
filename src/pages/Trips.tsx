import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTrips } from "@/services/tripService";

interface Trip {
  id: string;
  tripId: string;
  origin: string;
  destination: string;
  vehicle: string;
  driver: string;
  startDate: string;
  eta: string;
  status: string;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Completed": return "default";
    case "In Transit": return "secondary";
    case "Ongoing": return "secondary";
    case "Created": return "outline";
    case "Delayed": return "destructive";
    default: return "outline";
  }
};

const columns: Column<Trip>[] = [
  { key: "tripId", header: "Trip ID" },
  { key: "origin", header: "Origin" },
  { key: "destination", header: "Destination" },
  { key: "vehicle", header: "Vehicle" },
  { key: "driver", header: "Driver" },
  { key: "startDate", header: "Start Date" },
  { key: "eta", header: "ETA" },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <Badge variant={getStatusVariant(item.status)}>
        {item.status}
      </Badge>
    ),
  },
];

const Trips = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["trips"], queryFn: listTrips });
  const rows: Trip[] = (data || []).map((t: any) => ({
    id: t.tripId,
    tripId: t.tripId,
    origin: t.origin,
    destination: t.destination,
    vehicle: t.vehicle,
    driver: t.driver,
    startDate: t.startDate || "",
    eta: t.eta || "",
    status: t.status || "",
  }));
  const handleDelete = (item: Trip) => toast.info(`Delete trip: ${item.tripId} - Backend integration pending`);

  return (
    <DashboardLayout>
      <DataTable
        title="Trips"
        data={rows}
        columns={columns}
        searchKey="tripId"
        addUrl="/trips/add"
        viewUrl={(id) => `/trips/view/${id}`}
        editUrl={(id) => `/trips/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Trips;
