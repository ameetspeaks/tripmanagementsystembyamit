import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTransporters, deleteTransporter } from "@/services/transporterService";
import { toast } from "sonner";

interface TransporterRow {
  id: string;
  transporterName: string;
  code: string;
  email: string;
  mobile: string;
  isActive: string;
}

const columns: Column<TransporterRow>[] = [
  { key: "transporterName", header: "Transporter" },
  { key: "code", header: "Code" },
  { key: "email", header: "Email" },
  { key: "mobile", header: "Mobile" },
  { key: "isActive", header: "Active" },
];

const TransporterMaster = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["transporters"], queryFn: listTransporters });

  const handleDelete = async (item: TransporterRow) => {
    try {
      await deleteTransporter(item.id);
      toast.success("Transporter deleted");
      queryClient.invalidateQueries({ queryKey: ["transporters"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const rows: TransporterRow[] = (data || []).map((t) => ({
    id: t.id,
    transporterName: t.transporterName,
    code: t.code,
    email: t.email || "",
    mobile: t.mobile || "",
    isActive: t.isActive,
  }));

  return (
    <DashboardLayout>
      <DataTable
        title="Transporters"
        data={rows}
        columns={columns}
        searchKey="transporterName"
        addUrl="/transporters/add"
        viewUrl={(id) => `/transporters/view/${id}`}
        editUrl={(id) => `/transporters/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default TransporterMaster;
