import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listShipments, deleteShipment } from "@/services/shipmentService";

interface Shipment {
  id: string;
  name: string;
  code: string;
  skuCode: string;
  isBulk: string;
  packaging: string;
  units: string;
  weight: string;
  status: string;
}

const getStatusVariant = (status: string) => {
  switch (status) {
    case "Active": return "default";
    case "Inactive": return "secondary";
    default: return "outline";
  }
};

const columns: Column<Shipment>[] = [
  { key: "name", header: "Name" },
  { key: "code", header: "Code" },
  { key: "skuCode", header: "SKU Code" },
  { 
    key: "isBulk", 
    header: "Bulk",
    render: (item) => (
      <Badge variant={item.isBulk === "Y" ? "secondary" : "outline"}>
        {item.isBulk === "Y" ? "Yes" : "No"}
      </Badge>
    ),
  },
  { key: "packaging", header: "Packaging" },
  { key: "units", header: "Units" },
  { key: "weight", header: "Weight" },
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

const Shipments = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["shipments"], queryFn: listShipments });

  const handleDelete = async (item: Shipment) => {
    try {
      await deleteShipment(item.id);
      toast.success("Material deleted");
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Materials / Packaging"
        data={(data || []).map(s => ({
          id: s.id,
          name: s.name,
          code: s.code,
          skuCode: s.skuCode,
          isBulk: s.isBulk,
          packaging: s.packaging,
          units: s.units,
          weight: `${s.weight} ${s.weightUoM}`,
          status: s.status,
        }))}
        columns={columns}
        searchKey="name"
        addUrl="/shipments/add"
        viewUrl={(id) => `/shipments/view/${id}`}
        editUrl={(id) => `/shipments/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Shipments;
