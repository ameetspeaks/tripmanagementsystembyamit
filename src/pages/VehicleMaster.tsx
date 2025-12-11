import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listVehicles, deleteVehicle } from "@/services/vehicleService";

interface VehicleRow {
  id: string;
  vehicleNumber: string;
  vehicleType: string;
  status: string;
}

const VehicleMaster = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["vehicles"], queryFn: listVehicles });

  const columns: Column<VehicleRow>[] = [
    { key: "vehicleNumber", header: "Vehicle Number" },
    { key: "vehicleType", header: "Vehicle Type" },
    {
      key: "status",
      header: "Status",
      render: (item) => (
        <span className={`status-badge ${
          item.status === "Active" ? "status-active" : 
          item.status === "Inactive" ? "status-inactive" : "status-pending"
        }`}>
          {item.status}
        </span>
      ),
    },
  ];

  const handleDelete = async (item: VehicleRow) => {
    try {
      await deleteVehicle(item.id);
      toast.success("Vehicle deleted");
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Vehicle Master"
        data={(data || []).map(v => ({
          id: v.id,
          vehicleNumber: v.vehicleNumber,
          vehicleType: v.vehicleTypeId ? v.vehicleTypeId : "",
          status: v.status,
        }))}
        columns={columns}
        searchKey="vehicleNumber"
        addUrl="/vehicle-master/add"
        viewUrl={(id) => `/vehicle-master/view/${id}`}
        editUrl={(id) => `/vehicle-master/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default VehicleMaster;
