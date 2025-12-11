import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listCustomers, deleteCustomer } from "@/services/customerService";

interface Partner {
  id: string;
  displayName: string;
  companyName: string;
  phoneNumber: string;
  email: string;
  gstNumber: string;
  address: string;
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

const columns: Column<Partner>[] = [
  { key: "displayName", header: "Display Name" },
  { key: "companyName", header: "Company Name" },
  { key: "phoneNumber", header: "Phone" },
  { key: "email", header: "Email" },
  { 
    key: "gstNumber", 
    header: "GST Number",
    render: (item) => item.gstNumber || <span className="text-muted-foreground">-</span>,
  },
  { key: "address", header: "Address" },
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

const PartnerMaster = () => {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["customers"], queryFn: listCustomers });

  const handleDelete = async (item: Partner) => {
    try {
      await deleteCustomer(item.id);
      toast.success("Customer deleted");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Customers / Consignees"
        data={(data || []).map((c) => ({
          id: c.id,
          displayName: c.displayName,
          companyName: c.companyName,
          phoneNumber: c.phoneNumber,
          email: c.email || "",
          gstNumber: c.gstNumber || "",
          address: c.address,
          status: c.status,
        }))}
        columns={columns}
        searchKey="companyName"
        addUrl="/partner-master/add"
        viewUrl={(id) => `/partner-master/view/${id}`}
        editUrl={(id) => `/partner-master/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default PartnerMaster;
