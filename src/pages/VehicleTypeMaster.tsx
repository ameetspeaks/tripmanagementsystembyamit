import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listVehicleTypes, deleteVehicleType } from "@/services/vehicleTypeService";
import { toast } from "sonner";

interface VehicleTypeRow {
  id: string;
  typeName: string;
  lengthM: number;
  breadthM: number;
  heightM: number;
  weightLoadCapacityTons: number;
  volumeLoadCapacityCum: number;
}

const columns: Column<VehicleTypeRow>[] = [
  { key: 'typeName', header: 'Type' },
  { key: 'lengthM', header: 'Length (m)' },
  { key: 'breadthM', header: 'Breadth (m)' },
  { key: 'heightM', header: 'Height (m)' },
  { key: 'weightLoadCapacityTons', header: 'Weight (t)' },
  { key: 'volumeLoadCapacityCum', header: 'Volume (m³)' },
];

const VehicleTypeMaster = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ['vehicle_types'], queryFn: listVehicleTypes });

  const handleDelete = async (item: VehicleTypeRow) => {
    try {
      await deleteVehicleType(item.id);
      toast.success('Vehicle type deleted');
      queryClient.invalidateQueries({ queryKey: ['vehicle_types'] });
    } catch (e: any) {
      toast.error(e.message || 'Delete failed');
    }
  };

  const rows: VehicleTypeRow[] = (data || []).map((t) => ({
    id: t.id,
    typeName: t.typeName,
    lengthM: t.lengthM,
    breadthM: t.breadthM,
    heightM: t.heightM,
    weightLoadCapacityTons: t.weightLoadCapacityTons,
    volumeLoadCapacityCum: t.volumeLoadCapacityCum,
  }));

  return (
    <DashboardLayout>
      <DataTable
        title="Vehicle Types"
        data={rows}
        columns={columns}
        searchKey="typeName"
        addUrl="/vehicle-types/add"
        viewUrl={(id) => `/vehicle-types/view/${id}`}
        editUrl={(id) => `/vehicle-types/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default VehicleTypeMaster;
