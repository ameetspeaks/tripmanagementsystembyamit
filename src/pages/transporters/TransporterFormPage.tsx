import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { FormPageLayout } from "@/components/forms/FormPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { createTransporter, getTransporter, updateTransporter } from "@/services/transporterService";

interface TransporterForm {
  transporterName: string;
  code: string;
  email?: string;
  mobile?: string;
  company?: string;
  address?: string;
  gstin?: string;
  pan?: string;
  isActive: 'Y' | 'N';
}

interface Props { mode: 'add' | 'view' | 'edit' }

export default function TransporterFormPage({ mode }: Props) {
  const navigate = useNavigate();
  const { id } = useParams();
  const { data: transporter } = useQuery({
    queryKey: ['transporter', id],
    queryFn: () => getTransporter(id as string),
    enabled: !!id && mode !== 'add',
  });

  const form = useForm<TransporterForm>({
    defaultValues: {
      transporterName: '',
      code: '',
      email: '',
      mobile: '',
      company: '',
      address: '',
      gstin: '',
      pan: '',
      isActive: 'Y',
    },
  });

  const isReadOnly = mode === 'view';

  if (transporter) {
    form.reset({
      transporterName: transporter.transporterName,
      code: transporter.code,
      email: transporter.email || '',
      mobile: transporter.mobile || '',
      company: transporter.company || '',
      address: transporter.address || '',
      gstin: transporter.gstin || '',
      pan: transporter.pan || '',
      isActive: transporter.isActive,
    });
  }

  const onSubmit = async (data: TransporterForm) => {
    try {
      if (mode === 'add') {
        await createTransporter(data);
        toast.success('Transporter created');
      } else if (mode === 'edit' && id) {
        await updateTransporter(id, data);
        toast.success('Transporter updated');
      }
      navigate('/transporters');
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    }
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="Transporter" backUrl="/transporters" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="transporterName">Transporter Name *</Label>
              <Input id="transporterName" {...form.register('transporterName')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="code">Code *</Label>
              <Input id="code" {...form.register('code')} disabled={isReadOnly} />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register('email')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input id="mobile" {...form.register('mobile')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isActive">Active</Label>
              <Input id="isActive" {...form.register('isActive')} disabled={isReadOnly} />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="company">Company</Label>
            <Input id="company" {...form.register('company')} disabled={isReadOnly} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input id="address" {...form.register('address')} disabled={isReadOnly} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="gstin">GSTIN</Label>
              <Input id="gstin" {...form.register('gstin')} disabled={isReadOnly} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pan">PAN</Label>
              <Input id="pan" {...form.register('pan')} disabled={isReadOnly} />
            </div>
          </div>
          {!isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="submit">{mode === 'add' ? 'Add Transporter' : 'Update Transporter'}</Button>
              <Button type="button" variant="outline" onClick={() => navigate('/transporters')}>Cancel</Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
