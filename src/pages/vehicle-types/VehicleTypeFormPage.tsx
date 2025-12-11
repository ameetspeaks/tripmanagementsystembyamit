import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createVehicleType } from "@/services/vehicleTypeService";

interface VehicleTypeForm {
  typeName: string;
  lengthM: number;
  breadthM: number;
  heightM: number;
  weightLoadCapacityTons: number;
  volumeLoadCapacityCum: number;
}

interface Props { mode: 'add' | 'view' | 'edit' }

export default function VehicleTypeFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const form = useForm<VehicleTypeForm>({
    defaultValues: {
      typeName: '',
      lengthM: 0,
      breadthM: 0,
      heightM: 0,
      weightLoadCapacityTons: 0,
      volumeLoadCapacityCum: 0,
    },
  });
  const isReadOnly = mode === 'view';

  const onSubmit = async (data: VehicleTypeForm) => {
    try {
      await createVehicleType(data);
      toast.success('Vehicle type created');
      navigate('/vehicle-types');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Vehicle Type" backUrl="/vehicle-types" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="typeName">Type *</Label>
            <Input id="typeName" {...form.register('typeName')} disabled={isReadOnly} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="lengthM">Length (m) *</Label>
              <Input id="lengthM" type="number" step="0.01" {...form.register('lengthM', { valueAsNumber: true })} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="breadthM">Breadth (m) *</Label>
              <Input id="breadthM" type="number" step="0.01" {...form.register('breadthM', { valueAsNumber: true })} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="heightM">Height (m) *</Label>
              <Input id="heightM" type="number" step="0.01" {...form.register('heightM', { valueAsNumber: true })} disabled={isReadOnly} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="weightLoadCapacityTons">Weight Capacity (t) *</Label>
              <Input id="weightLoadCapacityTons" type="number" step="0.01" {...form.register('weightLoadCapacityTons', { valueAsNumber: true })} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="volumeLoadCapacityCum">Volume Capacity (m³) *</Label>
              <Input id="volumeLoadCapacityCum" type="number" step="0.01" {...form.register('volumeLoadCapacityCum', { valueAsNumber: true })} disabled={isReadOnly} />
            </div>
          </div>
          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">{mode === 'add' ? 'Add Vehicle Type' : 'Update Vehicle Type'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/vehicle-types')}>Cancel</Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
