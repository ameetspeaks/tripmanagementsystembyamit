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
import { shipmentSchema, ShipmentFormData } from "@/lib/schemas";
import { Package, Ruler, Scale } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getShipment, createShipment, updateShipment } from "@/services/shipmentService";


const packagingTypes = ["Box", "Pallet", "Container", "Bag", "Drum", "Bulk", "Carton", "Crate"];
const unitTypes = ["Pieces", "Cartons", "Pallets", "Tons", "Kilograms", "Liters", "Bags"];
const weightUoMs = ["kg", "g", "lb", "ton"];
const volumeUoMs = ["m³", "cm³", "L", "ft³"];
const statuses = ["Active", "Inactive"] as const;

interface ShipmentFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function ShipmentFormPage({ mode }: ShipmentFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();
  const { data: shipment } = useQuery({
    queryKey: ["shipment", id],
    queryFn: () => getShipment(id as string),
    enabled: !!id && mode !== "add",
  });

  const form = useForm<ShipmentFormData>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      name: "",
      isBulk: "N",
      code: "",
      description: "",
      skuCode: "",
      packaging: "",
      units: "",
      height: "",
      width: "",
      length: "",
      weight: "",
      weightUoM: "kg",
      volume: "",
      volumeUoM: "m³",
      status: "Active",
    },
  });

  const isReadOnly = mode === "view";
  const isBulk = form.watch("isBulk") === "Y";

  if (shipment) {
    form.reset({
      name: shipment.name,
      isBulk: shipment.isBulk,
      code: shipment.code,
      description: shipment.description || "",
      skuCode: shipment.skuCode,
      packaging: shipment.packaging,
      units: shipment.units,
      height: shipment.height != null ? String(shipment.height) : "",
      width: shipment.width != null ? String(shipment.width) : "",
      length: shipment.length != null ? String(shipment.length) : "",
      weight: String(shipment.weight),
      weightUoM: shipment.weightUoM,
      volume: String(shipment.volume),
      volumeUoM: shipment.volumeUoM,
      status: shipment.status,
    });
  }

  const onSubmit = async (data: ShipmentFormData) => {
    const weightNum = parseFloat(data.weight);
    if (data.isBulk === "Y" && !(weightNum >= 100)) {
      toast.error("Bulk items must meet weight threshold (>= 100)");
      return;
    }
    try {
      if (mode === "add") {
        await createShipment(data);
        toast.success("Material/Packaging added successfully");
      } else if (mode === "edit" && id) {
        await updateShipment(id, data);
        toast.success("Material/Packaging updated successfully");
      }
      queryClient.invalidateQueries({ queryKey: ["shipments"] });
      navigate("/shipments");
    } catch (e: any) {
      toast.error(e.message || "Save failed");
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Material / Packaging" backUrl="/shipments" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Package className="w-5 h-5 text-primary" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    disabled={isReadOnly}
                    placeholder="Material name"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="code">Code *</Label>
                  <Input
                    id="code"
                    {...form.register("code")}
                    disabled={isReadOnly || mode === "edit"}
                    placeholder="Unique SKU code"
                  />
                  {form.formState.errors.code && (
                    <p className="text-sm text-destructive">{form.formState.errors.code.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skuCode">SKU Code *</Label>
                  <Input
                    id="skuCode"
                    {...form.register("skuCode")}
                    disabled={isReadOnly}
                    placeholder="SKU identifier"
                  />
                  {form.formState.errors.skuCode && (
                    <p className="text-sm text-destructive">{form.formState.errors.skuCode.message}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  {...form.register("description")}
                  disabled={isReadOnly}
                  placeholder="Material description"
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="isBulk">Is Bulk *</Label>
                  <Select
                    disabled={isReadOnly}
                    value={form.watch("isBulk")}
                    onValueChange={(value) => form.setValue("isBulk", value as "Y" | "N")}
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
                  <Label htmlFor="packaging">Packaging *</Label>
                  <Select
                    disabled={isReadOnly}
                    value={form.watch("packaging")}
                    onValueChange={(value) => form.setValue("packaging", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select packaging" />
                    </SelectTrigger>
                    <SelectContent>
                      {packagingTypes.map((type) => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.packaging && (
                    <p className="text-sm text-destructive">{form.formState.errors.packaging.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="units">Units *</Label>
                  <Select
                    disabled={isReadOnly}
                    value={form.watch("units")}
                    onValueChange={(value) => form.setValue("units", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select unit" />
                    </SelectTrigger>
                    <SelectContent>
                      {unitTypes.map((unit) => (
                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.units && (
                    <p className="text-sm text-destructive">{form.formState.errors.units.message}</p>
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
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Dimensions */}
          {!isBulk && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Ruler className="w-5 h-5 text-primary" />
                  Dimensions (cm)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="height">Height</Label>
                    <Input
                      id="height"
                      {...form.register("height")}
                      disabled={isReadOnly}
                      placeholder="Height in cm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="width">Width</Label>
                    <Input
                      id="width"
                      {...form.register("width")}
                      disabled={isReadOnly}
                      placeholder="Width in cm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="length">Length</Label>
                    <Input
                      id="length"
                      {...form.register("length")}
                      disabled={isReadOnly}
                      placeholder="Length in cm"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Weight & Volume */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Scale className="w-5 h-5 text-primary" />
                Weight & Volume
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight">Weight *</Label>
                  <Input
                    id="weight"
                    {...form.register("weight")}
                    disabled={isReadOnly}
                    placeholder="Weight value"
                  />
                  {form.formState.errors.weight && (
                    <p className="text-sm text-destructive">{form.formState.errors.weight.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weightUoM">Weight UoM *</Label>
                  <Select
                    disabled={isReadOnly}
                    value={form.watch("weightUoM")}
                    onValueChange={(value) => form.setValue("weightUoM", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {weightUoMs.map((uom) => (
                        <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.weightUoM && (
                    <p className="text-sm text-destructive">{form.formState.errors.weightUoM.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Volume *</Label>
                  <Input
                    id="volume"
                    {...form.register("volume")}
                    disabled={isReadOnly}
                    placeholder="Volume value"
                  />
                  {form.formState.errors.volume && (
                    <p className="text-sm text-destructive">{form.formState.errors.volume.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volumeUoM">Volume UoM *</Label>
                  <Select
                    disabled={isReadOnly}
                    value={form.watch("volumeUoM")}
                    onValueChange={(value) => form.setValue("volumeUoM", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {volumeUoMs.map((uom) => (
                        <SelectItem key={uom} value={uom}>{uom}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.volumeUoM && (
                    <p className="text-sm text-destructive">{form.formState.errors.volumeUoM.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">
                {mode === "add" ? "Add Material/Packaging" : "Update Material/Packaging"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/shipments")}>
                Cancel
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/shipments/edit/${id}`)}>
                Edit Material/Packaging
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
