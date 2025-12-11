import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

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

const mockTrips: Trip[] = [
  { id: "1", tripId: "TRP001", origin: "Mumbai Hub", destination: "Delhi Warehouse", vehicle: "MH12AB1234", driver: "Ramesh Kumar", startDate: "2024-01-15", eta: "2024-01-17", status: "In Transit" },
  { id: "2", tripId: "TRP002", origin: "Chennai Depot", destination: "Bangalore Center", vehicle: "TN07EF9012", driver: "Suresh Yadav", startDate: "2024-01-14", eta: "2024-01-15", status: "Completed" },
  { id: "3", tripId: "TRP003", origin: "Delhi Warehouse", destination: "Hyderabad Point", vehicle: "DL04GH3456", driver: "Mahesh Singh", startDate: "2024-01-16", eta: "2024-01-18", status: "Scheduled" },
  { id: "4", tripId: "TRP004", origin: "Bangalore Center", destination: "Mumbai Hub", vehicle: "KA01CD5678", driver: "Rajesh Patel", startDate: "2024-01-13", eta: "2024-01-15", status: "Delayed" },
  { id: "5", tripId: "TRP005", origin: "Hyderabad Point", destination: "Chennai Depot", vehicle: "GJ06IJ7890", driver: "Dinesh Sharma", startDate: "2024-01-15", eta: "2024-01-16", status: "In Transit" },
];

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Completed": return "default";
    case "In Transit": return "secondary";
    case "Scheduled": return "outline";
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
  const handleDelete = (item: Trip) => toast.info(`Delete trip: ${item.tripId} - Backend integration pending`);

  return (
    <DashboardLayout>
      <DataTable
        title="Trips"
        data={mockTrips}
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
