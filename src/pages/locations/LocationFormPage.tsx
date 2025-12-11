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
import { locationSchema, LocationFormData } from "@/lib/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getLocation, createLocation, updateLocation } from "@/services/locationService";

const locationTypes = ["Node", "Consignee", "Hub", "Warehouse", "Depot"];
const statuses = ["Active", "Inactive"] as const;

interface LocationFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function LocationFormPage({ mode }: LocationFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: loc } = useQuery({ queryKey: ["location", id], queryFn: () => getLocation(id as string), enabled: !!id && mode !== "add" });

  const form = useForm<LocationFormData>({
    resolver: zodResolver(locationSchema),
    defaultValues: {
      address: "",
      locationName: "",
      consigneeCode: "",
      consigneeName: "",
      simRadius: "5000",
      gpsRadius: "500",
      latitude: "",
      longitude: "",
      locationType: "Node",
      cityName: "",
      pincode: "",
      stateName: "",
      district: "",
      zone: "",
      taluka: "",
      areaOffice: "",
      integrationId: "",
      status: "Active",
    },
  });

  const isReadOnly = mode === "view";
  if (loc) {
    form.reset({
      address: loc.address || "",
      locationName: loc.locationName,
      consigneeCode: loc.consigneeCode || "",
      consigneeName: loc.consigneeName || "",
      simRadius: String(loc.simRadius),
      gpsRadius: String(loc.gpsRadius),
      latitude: loc.latitude != null ? String(loc.latitude) : "",
      longitude: loc.longitude != null ? String(loc.longitude) : "",
      locationType: loc.locationType,
      cityName: loc.cityName,
      pincode: loc.pincode,
      stateName: loc.stateName,
      district: loc.district || "",
      zone: loc.zone || "",
      taluka: loc.taluka || "",
      areaOffice: loc.areaOffice || "",
      integrationId: loc.integrationId || "",
      status: loc.status as any,
    });
  }

  const onSubmit = async (data: LocationFormData) => {
    try {
      if (mode === "add") {
        await createLocation(data);
        toast.success("Location added successfully");
      } else if (mode === "edit" && id) {
        await updateLocation(id, data);
        toast.success("Location updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["locations"] });
      navigate("/locations");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Location" backUrl="/locations" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="locationName">Location Name *</Label>
              <Input
                id="locationName"
                {...form.register("locationName")}
                disabled={isReadOnly}
                placeholder="e.g., Mumbai Hub"
              />
              {form.formState.errors.locationName && (
                <p className="text-sm text-destructive">{form.formState.errors.locationName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationType">Location Type *</Label>
              <Select
                disabled={isReadOnly}
                value={form.watch("locationType")}
                onValueChange={(value) => form.setValue("locationType", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {locationTypes.map((type) => (
                    <SelectItem key={type} value={type}>{type}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.locationType && (
                <p className="text-sm text-destructive">{form.formState.errors.locationType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="cityName">City *</Label>
              <Input
                id="cityName"
                {...form.register("cityName")}
                disabled={isReadOnly}
                placeholder="City name"
              />
              {form.formState.errors.city && (
                <p className="text-sm text-destructive">{form.formState.errors.city.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="stateName">State *</Label>
              <Input
                id="stateName"
                {...form.register("stateName")}
                disabled={isReadOnly}
                placeholder="State name"
              />
              {form.formState.errors.state && (
                <p className="text-sm text-destructive">{form.formState.errors.state.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input
                id="pincode"
                {...form.register("pincode")}
                disabled={isReadOnly}
                placeholder="6-digit pincode"
                maxLength={6}
              />
              {form.formState.errors.pincode && (
                <p className="text-sm text-destructive">{form.formState.errors.pincode.message}</p>
              )}
            </div>

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
                {mode === "add" ? "Add Location" : "Update Location"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/lanes")}>
                Cancel
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/lanes/edit/${id}`)}>
                Edit Location
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
