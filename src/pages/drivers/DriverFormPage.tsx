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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { driverSchema, DriverFormData } from "@/lib/schemas";
import { User, FileText, Shield } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { createDriver, getDriver, updateDriver, initiateConsent } from "@/services/driverService";
import { useEffect } from "react";

const mockDrivers: Record<string, DriverFormData> = {
  "1": {
    name: "Ramesh Kumar",
    mobileNumber: "9876543210",
    isDedicated: "Y",
    locationCode: "MUM-001",
    licenseNumber: "MH1220200012345",
    licenseIssueDate: "2020-01-15",
    licenseExpiryDate: "2035-01-14",
    aadhaarNumber: "1234-5678-9012",
    panNumber: "ABCDE1234F",
    voterIdNumber: "",
    passportNumber: "",
    policeVerificationNumber: "PV-2023-001",
    policeVerificationIssueDate: "2023-06-01",
    policeVerificationExpiryDate: "2024-06-01",
    status: "Active",
  },
  "2": {
    name: "Suresh Yadav",
    mobileNumber: "9876543211",
    isDedicated: "N",
    locationCode: "",
    licenseNumber: "KA0120190054321",
    licenseIssueDate: "2019-05-20",
    licenseExpiryDate: "2034-05-19",
    aadhaarNumber: "9876-5432-1098",
    panNumber: "XYZAB5678G",
    voterIdNumber: "ABC1234567",
    passportNumber: "",
    policeVerificationNumber: "",
    policeVerificationIssueDate: "",
    policeVerificationExpiryDate: "",
    status: "Active",
  },
};

const statuses = ["Active", "Inactive", "Pending"] as const;

interface DriverFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function DriverFormPage({ mode }: DriverFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: driver } = useQuery({
    queryKey: ["driver", id],
    queryFn: () => getDriver(id as string),
    enabled: !!id && mode !== "add",
  });

  const form = useForm<DriverFormData>({
    resolver: zodResolver(driverSchema),
    defaultValues: {
      name: "",
      mobileNumber: "",
      isDedicated: "N",
      locationCode: "",
      licenseNumber: "",
      licenseIssueDate: "",
      licenseExpiryDate: "",
      aadhaarNumber: "",
      panNumber: "",
      voterIdNumber: "",
      passportNumber: "",
      policeVerificationNumber: "",
      policeVerificationIssueDate: "",
      policeVerificationExpiryDate: "",
      status: "Active",
    },
  });

  const isReadOnly = mode === "view";
  const isDedicated = form.watch("isDedicated") === "Y";

  useEffect(() => {
    if (driver) {
      form.reset({
        name: driver.name,
        mobileNumber: driver.mobileNumber,
        isDedicated: driver.isDedicated,
        locationCode: driver.locationCode || "",
        licenseNumber: driver.licenseNumber,
        licenseIssueDate: driver.licenseIssueDate || "",
        licenseExpiryDate: driver.licenseExpiryDate,
        aadhaarNumber: driver.aadhaarNumber || "",
        panNumber: driver.panNumber || "",
        voterIdNumber: driver.voterIdNumber || "",
        passportNumber: driver.passportNumber || "",
        policeVerificationNumber: driver.policeVerificationNumber || "",
        policeVerificationIssueDate: driver.policeVerificationIssueDate || "",
        policeVerificationExpiryDate: driver.policeVerificationExpiryDate || "",
        status: driver.status,
      });
    }
  }, [driver]);

  const onSubmit = async (data: DriverFormData) => {
    // Validate license expiry date
    const expiryDate = new Date(data.licenseExpiryDate);
    if (expiryDate < new Date()) {
      toast.error("License expiry date cannot be in the past");
      return;
    }

    try {
      if (mode === "add") {
        await createDriver(data);
        toast.success("Driver added successfully");
      } else if (mode === "edit" && id) {
        await updateDriver(id, data);
        toast.success("Driver updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      navigate("/driver");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Driver" backUrl="/driver" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Driver Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    disabled={isReadOnly}
                    placeholder="Full name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobileNumber">Mobile Number *</Label>
                  <Input
                    id="mobileNumber"
                    {...form.register("mobileNumber")}
                    disabled={isReadOnly}
                    placeholder="10-digit mobile number"
                    maxLength={10}
                  />
                  {form.formState.errors.mobileNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.mobileNumber.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Must be unique across all drivers</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                {isDedicated && (
                  <div className="space-y-2">
                    <Label htmlFor="locationCode">Location Code</Label>
                    <Input
                      id="locationCode"
                      {...form.register("locationCode")}
                      disabled={isReadOnly}
                      placeholder="Node location code"
                    />
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
            </CardContent>
          </Card>

          {/* License Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileText className="w-5 h-5 text-primary" />
                License Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">License Number *</Label>
                  <Input
                    id="licenseNumber"
                    {...form.register("licenseNumber")}
                    disabled={isReadOnly}
                    placeholder="Driving license number"
                  />
                  {form.formState.errors.licenseNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.licenseNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseIssueDate">Issue Date</Label>
                  <Input
                    id="licenseIssueDate"
                    type="date"
                    {...form.register("licenseIssueDate")}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="licenseExpiryDate">Expiry Date *</Label>
                  <Input
                    id="licenseExpiryDate"
                    type="date"
                    {...form.register("licenseExpiryDate")}
                    disabled={isReadOnly}
                  />
                  {form.formState.errors.licenseExpiryDate && (
                    <p className="text-sm text-destructive">{form.formState.errors.licenseExpiryDate.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Cannot be a past date</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Identity Documents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="w-5 h-5 text-primary" />
                Identity Documents (Optional)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaarNumber">Aadhaar Number</Label>
                  <Input
                    id="aadhaarNumber"
                    {...form.register("aadhaarNumber")}
                    disabled={isReadOnly}
                    placeholder="XXXX-XXXX-XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="panNumber">PAN Number</Label>
                  <Input
                    id="panNumber"
                    {...form.register("panNumber")}
                    disabled={isReadOnly}
                    placeholder="10 alphanumeric characters"
                    maxLength={10}
                    className="uppercase"
                  />
                  {form.formState.errors.panNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.panNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="voterIdNumber">Voter ID Number</Label>
                  <Input
                    id="voterIdNumber"
                    {...form.register("voterIdNumber")}
                    disabled={isReadOnly}
                    placeholder="Voter ID"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Passport Number</Label>
                  <Input
                    id="passportNumber"
                    {...form.register("passportNumber")}
                    disabled={isReadOnly}
                    placeholder="Passport number"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Police Verification */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Police Verification (Optional)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="policeVerificationNumber">Verification Number</Label>
                  <Input
                    id="policeVerificationNumber"
                    {...form.register("policeVerificationNumber")}
                    disabled={isReadOnly}
                    placeholder="PV reference number"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policeVerificationIssueDate">Issue Date</Label>
                  <Input
                    id="policeVerificationIssueDate"
                    type="date"
                    {...form.register("policeVerificationIssueDate")}
                    disabled={isReadOnly}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="policeVerificationExpiryDate">Expiry Date</Label>
                  <Input
                    id="policeVerificationExpiryDate"
                    type="date"
                    {...form.register("policeVerificationExpiryDate")}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {mode === "add" ? "Add Driver" : "Update Driver"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/driver")}> 
                Cancel
              </Button>
              {mode !== "add" && id && (
                <Button type="button" variant="secondary" onClick={async () => {
                  try {
                    await initiateConsent(id);
                    toast.success("Consent initiated");
                    queryClient.invalidateQueries({ queryKey: ["driver", id] });
                  } catch (e: any) {
                    toast.error(e.message || "Consent initiation failed");
                  }
                }}>
                  Initiate Consent
                </Button>
              )}
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/driver/edit/${id}`)}>
                Edit Driver
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
