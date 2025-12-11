import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { partnerSchema, PartnerFormData } from "@/lib/schemas";
import { Building2, Phone, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { createCustomer, getCustomer, updateCustomer } from "@/services/customerService";
import { useEffect } from "react";


const statuses = ["Active", "Inactive", "Pending"] as const;

interface PartnerFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function PartnerFormPage({ mode }: PartnerFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: customer } = useQuery({
    queryKey: ["customer", id],
    queryFn: () => getCustomer(id as string),
    enabled: !!id && mode !== "add",
  });

  const form = useForm<PartnerFormData>({
    resolver: zodResolver(partnerSchema),
    defaultValues: {
      displayName: "",
      companyName: "",
      email: "",
      gstNumber: "",
      panNumber: "",
      phoneNumber: "",
      address: "",
      integrationCode: "",
      secondaryEmail: "",
      secondaryPhoneNumber: "",
      status: "Active",
    },
  });

  const isReadOnly = mode === "view";

  useEffect(() => {
    if (customer) {
      form.reset({
        displayName: customer.displayName,
        companyName: customer.companyName,
        email: customer.email || "",
        gstNumber: customer.gstNumber || "",
        panNumber: customer.panNumber || "",
        phoneNumber: customer.phoneNumber,
        address: customer.address,
        integrationCode: customer.integrationCode || "",
        secondaryEmail: customer.secondaryEmail || "",
        secondaryPhoneNumber: customer.secondaryPhoneNumber || "",
        status: customer.status,
      });
    }
  }, [customer]);

  const onSubmit = async (data: PartnerFormData) => {
    try {
      if (mode === "add") {
        await createCustomer(data);
        toast.success("Customer/Consignee added successfully");
      } else if (mode === "edit" && id) {
        await updateCustomer(id, data);
        toast.success("Customer/Consignee updated successfully");
      }
      navigate("/partner-master");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Customer / Consignee" backUrl="/partner-master" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name *</Label>
                  <Input
                    id="displayName"
                    {...form.register("displayName")}
                    disabled={isReadOnly}
                    placeholder="Short name (e.g., Selvan)"
                  />
                  {form.formState.errors.displayName && (
                    <p className="text-sm text-destructive">{form.formState.errors.displayName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    {...form.register("companyName")}
                    disabled={isReadOnly}
                    placeholder="Full legal name"
                  />
                  {form.formState.errors.companyName && (
                    <p className="text-sm text-destructive">{form.formState.errors.companyName.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address *</Label>
                <Textarea
                  id="address"
                  {...form.register("address")}
                  disabled={isReadOnly}
                  placeholder="Registered/Delivery address"
                  rows={3}
                />
                {form.formState.errors.address && (
                  <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="integrationCode">Integration Code</Label>
                  <Input
                    id="integrationCode"
                    {...form.register("integrationCode")}
                    disabled={isReadOnly}
                    placeholder="External ERP/CRM code"
                  />
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
            </CardContent>
          </Card>

          {/* Tax Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tax Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="gstNumber">GST Number</Label>
                  <Input
                    id="gstNumber"
                    {...form.register("gstNumber")}
                    disabled={isReadOnly}
                    placeholder="15 alphanumeric characters"
                    maxLength={15}
                    className="uppercase"
                  />
                  {form.formState.errors.gstNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.gstNumber.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Optional for foreign customers</p>
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
                  <p className="text-xs text-muted-foreground">India only</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Phone className="w-5 h-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phoneNumber">Primary Phone *</Label>
                  <Input
                    id="phoneNumber"
                    {...form.register("phoneNumber")}
                    disabled={isReadOnly}
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                  {form.formState.errors.phoneNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.phoneNumber.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryPhoneNumber">Secondary Phone</Label>
                  <Input
                    id="secondaryPhoneNumber"
                    {...form.register("secondaryPhoneNumber")}
                    disabled={isReadOnly}
                    placeholder="10-digit phone number"
                    maxLength={10}
                  />
                  {form.formState.errors.secondaryPhoneNumber && (
                    <p className="text-sm text-destructive">{form.formState.errors.secondaryPhoneNumber.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Primary Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register("email")}
                    disabled={isReadOnly}
                    placeholder="primary@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="secondaryEmail">Secondary Email</Label>
                  <Input
                    id="secondaryEmail"
                    type="email"
                    {...form.register("secondaryEmail")}
                    disabled={isReadOnly}
                    placeholder="secondary@example.com"
                  />
                  {form.formState.errors.secondaryEmail && (
                    <p className="text-sm text-destructive">{form.formState.errors.secondaryEmail.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {mode === "add" ? "Add Customer/Consignee" : "Update Customer/Consignee"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/partner-master")}>
                Cancel
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/partner-master/edit/${id}`)}>
                Edit Customer/Consignee
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
