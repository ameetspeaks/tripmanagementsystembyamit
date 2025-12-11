import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listTrackingAssets, deleteTrackingAsset } from "@/services/trackingAssetService";

interface TrackingAsset {
  id: string;
  assetId: string;
  assetType: string;
  manufacturer: string;
  simNumber: string;
  vehicleAssigned: string;
  status: string;
}

const TrackingAssetPage = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["tracking_assets"], queryFn: listTrackingAssets });

const columns: Column<TrackingAsset>[] = [
  { key: "assetId", header: "Asset ID" },
  { key: "assetType", header: "Type" },
  { key: "manufacturer", header: "Manufacturer" },
  { key: "simNumber", header: "SIM Number" },
  { key: "vehicleAssigned", header: "Vehicle Assigned" },
  {
    key: "status",
    header: "Status",
    render: (item) => (
      <span className={`status-badge ${
        item.status === "Active" ? "status-active" : "status-inactive"
      }`}>
        {item.status}
      </span>
    ),
  },
];

  const handleDelete = async (item: TrackingAsset) => {
    try {
      await deleteTrackingAsset(item.id);
      toast.success("Tracking asset deleted");
      queryClient.invalidateQueries({ queryKey: ["tracking_assets"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Tracking Assets"
        data={(data || []).map(a => ({
          id: a.id,
          assetId: a.assetId,
          assetType: a.assetType,
          manufacturer: a.displayName || "",
          simNumber: "",
          vehicleAssigned: "",
          status: a.status,
        }))}
        columns={columns}
        searchKey="assetId"
        addUrl="/tracking-asset/add"
        viewUrl={(id) => `/tracking-asset/view/${id}`}
        editUrl={(id) => `/tracking-asset/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default TrackingAssetPage;
