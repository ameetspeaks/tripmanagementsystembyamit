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
import { vehicleSchema, VehicleFormData } from "@/lib/schemas";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getVehicle, createVehicle, updateVehicle } from "@/services/vehicleService";
const statuses = ["Active", "Inactive", "Pending"] as const;

interface VehicleFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function VehicleFormPage({ mode }: VehicleFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: vehicle } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: () => getVehicle(id as string),
    enabled: !!id && mode !== "add",
  });

  const form = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
    defaultValues: {
      vehicleNumber: "",
      vehicleType: "",
      trackingAsset: "",
      isDedicated: "N",
      locationCode: "",
      integrationCode: "",
      status: "Active",
      rcNumber: "",
      rcIssueDate: "",
      rcExpiryDate: "",
      pucNumber: "",
      pucIssueDate: "",
      pucExpiryDate: "",
      insuranceNumber: "",
      insuranceIssueDate: "",
      insuranceExpiryDate: "",
      fitnessNumber: "",
      fitnessIssueDate: "",
      fitnessExpiryDate: "",
      permitNumber: "",
      permitIssueDate: "",
      permitExpiryDate: "",
      hydraulicTestNumber: "",
      hydraulicTestIssueDate: "",
      hydraulicTestExpiryDate: "",
    },
  });

  const isReadOnly = mode === "view";

  const onSubmit = async (data: VehicleFormData) => {
    const expiryDates = [
      data.rcExpiryDate,
      data.pucExpiryDate,
      data.insuranceExpiryDate,
      data.fitnessExpiryDate,
      data.permitExpiryDate,
      data.hydraulicTestExpiryDate,
    ].filter(Boolean) as string[];
    const past = expiryDates.find((d) => new Date(d) < new Date());
    if (past) {
      toast.error("Expiry dates cannot be in the past");
      return;
    }
    try {
      if (mode === "add") {
        await createVehicle(data);
        toast.success("Vehicle added successfully");
      } else if (mode === "edit" && id) {
        await updateVehicle(id, data);
        toast.success("Vehicle updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      navigate("/vehicle-master");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Vehicle" backUrl="/vehicle-master" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleNumber">Vehicle Number *</Label>
              <Input
                id="vehicleNumber"
                {...form.register("vehicleNumber")}
                disabled={isReadOnly}
                placeholder="e.g., MH12AB1234"
              />
              {form.formState.errors.vehicleNumber && (
                <p className="text-sm text-destructive">{form.formState.errors.vehicleNumber.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Input id="vehicleType" {...form.register("vehicleType")} disabled={isReadOnly} placeholder="e.g., 32XL" />
              {form.formState.errors.vehicleType && (
                <p className="text-sm text-destructive">{form.formState.errors.vehicleType.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="trackingAsset">Tracking Asset (SIM/GPS)</Label>
              <Input id="trackingAsset" {...form.register("trackingAsset")} disabled={isReadOnly} placeholder="Device ID" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="isDedicated">Is Dedicated *</Label>
              <Select
                disabled={isReadOnly}
                value={form.watch("isDedicated")}
                onValueChange={(value) => form.setValue("isDedicated", value as "Y" | "N")}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Y">Yes</SelectItem>
                  <SelectItem value="N">No</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationCode">Location Code</Label>
              <Input id="locationCode" {...form.register("locationCode")} disabled={isReadOnly} placeholder="Node assignment" />
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
            <div className="space-y-2">
              <Label htmlFor="integrationCode">Integration Code</Label>
              <Input id="integrationCode" {...form.register("integrationCode")} disabled={isReadOnly} placeholder="ERP/CRM code" />
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Compliance Documents</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rcNumber">RC Number</Label>
                <Input id="rcNumber" {...form.register("rcNumber")} disabled={isReadOnly} />
                <Label htmlFor="rcIssueDate">RC Issue Date</Label>
                <Input id="rcIssueDate" type="date" {...form.register("rcIssueDate")} disabled={isReadOnly} />
                <Label htmlFor="rcExpiryDate">RC Expiry Date</Label>
                <Input id="rcExpiryDate" type="date" {...form.register("rcExpiryDate")} disabled={isReadOnly} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pucNumber">PUC Number</Label>
                <Input id="pucNumber" {...form.register("pucNumber")} disabled={isReadOnly} />
                <Label htmlFor="pucIssueDate">PUC Issue Date</Label>
                <Input id="pucIssueDate" type="date" {...form.register("pucIssueDate")} disabled={isReadOnly} />
                <Label htmlFor="pucExpiryDate">PUC Expiry Date</Label>
                <Input id="pucExpiryDate" type="date" {...form.register("pucExpiryDate")} disabled={isReadOnly} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="insuranceNumber">Insurance Number</Label>
                <Input id="insuranceNumber" {...form.register("insuranceNumber")} disabled={isReadOnly} />
                <Label htmlFor="insuranceIssueDate">Insurance Issue Date</Label>
                <Input id="insuranceIssueDate" type="date" {...form.register("insuranceIssueDate")} disabled={isReadOnly} />
                <Label htmlFor="insuranceExpiryDate">Insurance Expiry Date</Label>
                <Input id="insuranceExpiryDate" type="date" {...form.register("insuranceExpiryDate")} disabled={isReadOnly} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fitnessNumber">Fitness Number</Label>
                <Input id="fitnessNumber" {...form.register("fitnessNumber")} disabled={isReadOnly} />
                <Label htmlFor="fitnessIssueDate">Fitness Issue Date</Label>
                <Input id="fitnessIssueDate" type="date" {...form.register("fitnessIssueDate")} disabled={isReadOnly} />
                <Label htmlFor="fitnessExpiryDate">Fitness Expiry Date</Label>
                <Input id="fitnessExpiryDate" type="date" {...form.register("fitnessExpiryDate")} disabled={isReadOnly} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permitNumber">Permit Number</Label>
                <Input id="permitNumber" {...form.register("permitNumber")} disabled={isReadOnly} />
                <Label htmlFor="permitIssueDate">Permit Issue Date</Label>
                <Input id="permitIssueDate" type="date" {...form.register("permitIssueDate")} disabled={isReadOnly} />
                <Label htmlFor="permitExpiryDate">Permit Expiry Date</Label>
                <Input id="permitExpiryDate" type="date" {...form.register("permitExpiryDate")} disabled={isReadOnly} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hydraulicTestNumber">Hydraulic Test Number</Label>
                <Input id="hydraulicTestNumber" {...form.register("hydraulicTestNumber")} disabled={isReadOnly} />
                <Label htmlFor="hydraulicTestIssueDate">Hydraulic Test Issue Date</Label>
                <Input id="hydraulicTestIssueDate" type="date" {...form.register("hydraulicTestIssueDate")} disabled={isReadOnly} />
                <Label htmlFor="hydraulicTestExpiryDate">Hydraulic Test Expiry Date</Label>
                <Input id="hydraulicTestExpiryDate" type="date" {...form.register("hydraulicTestExpiryDate")} disabled={isReadOnly} />
              </div>
            </div>
          </div>

          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {mode === "add" ? "Add Vehicle" : "Update Vehicle"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/vehicle-master")}>
                Cancel
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/vehicle-master/edit/${id}`)}>
                Edit Vehicle
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
