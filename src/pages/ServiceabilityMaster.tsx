import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listServiceability, deleteServiceability } from "@/services/serviceabilityService";
import { toast } from "sonner";

interface Row {
  id: string;
  laneCode: string;
  freightTypeCode: string;
  serviceabilityMode: string;
  vehicleTypeCode: string;
  standardTat: number;
  expressTat: number | null;
}

const columns: Column<Row>[] = [
  { key: 'laneCode', header: 'Lane Code' },
  { key: 'freightTypeCode', header: 'Freight Type' },
  { key: 'serviceabilityMode', header: 'Mode' },
  { key: 'vehicleTypeCode', header: 'Vehicle Type' },
  { key: 'standardTat', header: 'Standard TAT (h)' },
  { key: 'expressTat', header: 'Express TAT (h)' },
];

const ServiceabilityMaster = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['serviceability'], queryFn: listServiceability });

  const handleDelete = async (item: Row) => {
    try {
      await deleteServiceability(item.id);
      toast.success('Serviceability entry deleted');
      queryClient.invalidateQueries({ queryKey: ['serviceability'] });
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const rows: Row[] = (data || []).map(s => ({
    id: s.id,
    laneCode: s.laneCode,
    freightTypeCode: s.freightTypeCode,
    serviceabilityMode: s.serviceabilityMode,
    vehicleTypeCode: s.vehicleTypeCode,
    standardTat: s.standardTat,
    expressTat: s.expressTat,
  }));

  return (
    <DashboardLayout>
      <DataTable
        title="Serviceability (Lanes)"
        data={rows}
        columns={columns}
        searchKey="laneCode"
        addUrl="/serviceability/add"
        viewUrl={(id) => `/serviceability/view/${id}`}
        editUrl={(id) => `/serviceability/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default ServiceabilityMaster;
