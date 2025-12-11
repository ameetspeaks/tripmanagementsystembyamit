import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trackingAssetSchema, TrackingAssetFormData } from "@/lib/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTrackingAsset, createTrackingAsset, updateTrackingAsset } from "@/services/trackingAssetService";
import { listDrivers } from "@/services/driverService";
import { listVehicles } from "@/services/vehicleService";

const assetTypes = ["SIM", "GPS", "DriverApp"] as const;
const statuses = ["Active", "Inactive"] as const;

interface TrackingAssetFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function TrackingAssetFormPage({ mode }: TrackingAssetFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: asset } = useQuery({
    queryKey: ["tracking_asset", id],
    queryFn: () => getTrackingAsset(id as string),
    enabled: !!id && mode !== "add",
  });
  const { data: drivers } = useQuery({ queryKey: ["drivers"], queryFn: listDrivers });
  const { data: vehicles } = useQuery({ queryKey: ["vehicles"], queryFn: listVehicles });

  const form = useForm<TrackingAssetFormData>({
    resolver: zodResolver(trackingAssetSchema),
    defaultValues: {
      assetId: "",
      assetType: "SIM",
      manufacturer: "",
      driverId: "",
      vehicleId: "",
      status: "Active",
    },
  });

  const isReadOnly = mode === "view";
  if (asset) {
    form.reset({
      assetId: asset.assetId,
      assetType: asset.assetType,
      manufacturer: asset.displayName || "",
      driverId: (asset as any).driverId || "",
      vehicleId: (asset as any).vehicleId || "",
      status: asset.status,
    });
  }

  const onSubmit = async (data: TrackingAssetFormData) => {
    try {
      if (mode === "add") {
        await createTrackingAsset(data);
        toast.success("Tracking asset added successfully");
      } else if (mode === "edit" && id) {
        await updateTrackingAsset(id, data);
        toast.success("Tracking asset updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["tracking_assets"] });
      navigate("/tracking-asset");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Tracking Asset" backUrl="/tracking-asset" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="assetId">Asset ID *</Label>
              <Input
                id="assetId"
                {...form.register("assetId")}
                disabled={isReadOnly}
                placeholder="e.g., GPS001"
              />
              {form.formState.errors.assetId && (
                <p className="text-sm text-destructive">{form.formState.errors.assetId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="assetType">Asset Type *</Label>
              <Select disabled={isReadOnly} value={form.watch("assetType")} onValueChange={(v) => form.setValue("assetType", v as typeof assetTypes[number])}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {assetTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Display Name *</Label>
              <Input id="manufacturer" {...form.register("manufacturer")} disabled={isReadOnly} placeholder="Asset display name" />
            </div>

            {form.watch("assetType") === "SIM" && (
              <div className="space-y-2">
                <Label htmlFor="driverId">Driver</Label>
                <Select disabled={isReadOnly} value={form.watch("driverId") || ""} onValueChange={(v) => form.setValue("driverId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {(drivers || []).map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.name} • {d.mobileNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {form.watch("assetType") === "GPS" && (
              <div className="space-y-2">
                <Label htmlFor="vehicleId">Vehicle</Label>
                <Select disabled={isReadOnly} value={form.watch("vehicleId") || ""} onValueChange={(v) => form.setValue("vehicleId", v)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select vehicle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {(vehicles || []).map((v) => (
                      <SelectItem key={v.id} value={v.id}>{v.vehicleNumber}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                disabled={isReadOnly}
                value={form.watch("status")}
                onValueChange={(value) => form.setValue("status", value as typeof statuses[number])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.status && (
                <p className="text-sm text-destructive">{form.formState.errors.status.message}</p>
              )}
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {mode === "add" ? "Add Tracking Asset" : "Update Tracking Asset"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/tracking-asset")}>
                Cancel
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/tracking-asset/edit/${id}`)}>
                Edit Tracking Asset
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
