import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { createServiceability } from "@/services/serviceabilityService";

interface FormData {
  laneCode: string;
  freightTypeCode: string;
  serviceabilityMode: string;
  transporterCode?: string;
  vehicleTypeCode: string;
  standardTat: number;
  expressTat?: number;
}

interface Props { mode: 'add' | 'view' | 'edit' }

export default function ServiceabilityFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const form = useForm<FormData>({
    defaultValues: {
      laneCode: '',
      freightTypeCode: '',
      serviceabilityMode: '',
      transporterCode: '',
      vehicleTypeCode: '',
      standardTat: 0,
      expressTat: 0,
    },
  });
  const isReadOnly = mode === 'view';

  const onSubmit = async (data: FormData) => {
    try {
      await createServiceability(data);
      toast.success('Serviceability saved');
      navigate('/serviceability');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Serviceability" backUrl="/serviceability" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="laneCode">Lane Code *</Label>
              <Input id="laneCode" {...form.register('laneCode')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="freightTypeCode">Freight Type *</Label>
              <Input id="freightTypeCode" {...form.register('freightTypeCode')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="serviceabilityMode">Mode *</Label>
              <Input id="serviceabilityMode" {...form.register('serviceabilityMode')} disabled={isReadOnly} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="vehicleTypeCode">Vehicle Type *</Label>
              <Input id="vehicleTypeCode" {...form.register('vehicleTypeCode')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="transporterCode">Transporter Code</Label>
              <Input id="transporterCode" {...form.register('transporterCode')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="standardTat">Standard TAT (h) *</Label>
              <Input id="standardTat" type="number" {...form.register('standardTat', { valueAsNumber: true })} disabled={isReadOnly} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="expressTat">Express TAT (h)</Label>
            <Input id="expressTat" type="number" {...form.register('expressTat', { valueAsNumber: true })} disabled={isReadOnly} />
          </div>
          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">{mode === 'add' ? 'Add Serviceability' : 'Update Serviceability'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/serviceability')}>Cancel</Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
