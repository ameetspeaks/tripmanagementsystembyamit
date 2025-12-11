import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DataTable, Column } from "@/components/data-table/DataTable";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { listLanes, deleteLane } from "@/services/laneService";
import { ArrowRight } from "lucide-react";

interface LaneRow {
  id: string;
  laneCode: string;
  laneName: string;
  laneType: string;
  modeOfTransport: string;
  originName: string;
  destinationName: string;
  distance: string;
  lanePrice: string;
  status: string;
}


const getStatusVariant = (status: string) => {
  switch (status) {
    case "Active": return "default";
    case "Inactive": return "secondary";
    default: return "outline";
  }
};

const getModeVariant = (mode: string) => {
  switch (mode) {
    case "Road": return "default";
    case "Rail": return "secondary";
    case "Air": return "outline";
    default: return "outline";
  }
};

const columns: Column<LaneRow>[] = [
  { key: "laneCode", header: "Lane Code" },
  { key: "laneName", header: "Lane Name" },
  { key: "laneType", header: "Lane Type" },
  { 
    key: "modeOfTransport", 
    header: "Mode",
    render: (item) => (
      <Badge variant={getModeVariant(item.modeOfTransport)}>
        {item.modeOfTransport}
      </Badge>
    ),
  },
  {
    key: "originName",
    header: "Route",
    render: (item) => (
      <div className="flex items-center gap-2">
        <span className="text-primary font-medium">{item.originName}</span>
        <ArrowRight className="w-4 h-4 text-muted-foreground" />
        <span className="text-destructive font-medium">{item.destinationName}</span>
      </div>
    ),
  },
  { key: "distance", header: "Distance" },
  { key: "lanePrice", header: "Price" },
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

const Lanes = () => {
  const queryClient = useQueryClient();
  const { data } = useQuery({ queryKey: ["lanes"], queryFn: listLanes });

  const handleDelete = async (item: LaneRow) => {
    try {
      await deleteLane(item.id);
      toast.success("Lane deleted");
      queryClient.invalidateQueries({ queryKey: ["lanes"] });
    } catch (e: any) {
      toast.error(e.message || "Delete failed");
    }
  };

  const rows: LaneRow[] = (data || []).map((l) => ({
    id: l.id,
    laneCode: l.laneCode,
    laneName: l.laneName,
    laneType: l.laneType,
    modeOfTransport: l.modeOfTransport,
    originName: l.originName,
    destinationName: l.destinationName,
    distance: `${l.distanceKm}`,
    lanePrice: l.lanePrice != null ? `${l.lanePrice}` : "",
    status: l.laneStatus,
  }));

  return (
    <DashboardLayout>
      <DataTable
        title="Lanes"
        data={rows}
        columns={columns}
        searchKey="laneName"
        addUrl="/lanes/add"
        viewUrl={(id) => `/lanes/view/${id}`}
        editUrl={(id) => `/lanes/edit/${id}`}
        onDelete={handleDelete}
      />
    </DashboardLayout>
  );
};

export default Lanes;
