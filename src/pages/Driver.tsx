import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listDrivers, deleteDriver } from "@/services/driverService";

interface Driver {
  id: string;
  name: string;
  mobileNumber: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  isDedicated: string;
  locationCode: string;
  status: string;
}


const getStatusVariant = (status: string) => {
  switch (status) {
    case "Active": return "default";
    case "Inactive": return "secondary";
    case "Pending": return "outline";
    default: return "outline";
  }
};

const isExpiringSoon = (dateStr: string) => {
  const expiryDate = new Date(dateStr);
  const today = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(today.getDate() + 30);
  return expiryDate <= thirtyDaysFromNow;
};

const columns: Column<Driver>[] = [
  { key: "name", header: "Name" },
  { key: "mobileNumber", header: "Mobile" },
  { key: "licenseNumber", header: "License No." },
  { 
    key: "licenseExpiryDate", 
    header: "License Expiry",
    render: (item) => (
      <span className={isExpiringSoon(item.licenseExpiryDate) ? "text-destructive font-medium" : ""}>
        {item.licenseExpiryDate}
        {isExpiringSoon(item.licenseExpiryDate) && (
          <Badge variant="destructive" className="ml-2 text-xs">Expiring</Badge>
        )}
      </span>
    ),
  },
  { 
    key: "isDedicated", 
    header: "Dedicated",
    render: (item) => (
      <Badge variant={item.isDedicated === "Y" ? "default" : "outline"}>
        {item.isDedicated === "Y" ? "Yes" : "No"}
      </Badge>
    ),
  },
  { 
    key: "locationCode", 
    header: "Location Code",
    render: (item) => item.locationCode || <span className="text-muted-foreground">-</span>,
  },
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

const DriverPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["drivers"], queryFn: listDrivers });

  const handleDelete = async (item: Driver) => {
    try {
      await deleteDriver(item.id);
      toast.success("Driver deleted");
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Drivers"
        data={(data || []).map((d) => ({
          id: d.id,
          name: d.name,
          mobileNumber: d.mobileNumber,
          licenseNumber: d.licenseNumber,
          licenseExpiryDate: d.licenseExpiryDate,
          isDedicated: d.isDedicated,
          locationCode: d.locationCode || "",
          status: d.status,
        }))}
        columns={columns}
        searchKey="name"
        addUrl="/driver/add"
        viewUrl={(id) => `/driver/view/${id}`}
        editUrl={(id) => `/driver/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default DriverPage;
