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
import { userSchema, UserFormData } from "@/lib/schemas";

const mockUsers = [
  { id: "1", userName: "Admin User", email: "admin@tripms.com", phone: "9876543210", role: "Admin", status: "Active" as const },
  { id: "2", userName: "Operations Manager", email: "ops@tripms.com", phone: "9876543211", role: "Manager", status: "Active" as const },
];

const roles = ["Admin", "Manager", "Supervisor", "Coordinator", "Analyst", "Operator"];
const statuses = ["Active", "Inactive"] as const;

interface UserFormPageProps {
  mode: "add" | "view" | "edit";
}

export default function UserFormPage({ mode }: UserFormPageProps) {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const existingUser = id ? mockUsers.find(u => u.id === id) : undefined;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: existingUser || {
      userName: "",
      email: "",
      phone: "",
      role: "",
      status: "Active",
    },
  });

  const isReadOnly = mode === "view";

  const onSubmit = (data: UserFormData) => {
    if (mode === "add") {
      toast.success("User added successfully");
    } else {
      toast.success("User updated successfully");
    }
    navigate("/users");
  };

  return (
    <DashboardLayout>
      <FormPageLayout title="User" backUrl="/users" mode={mode}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="userName">User Name *</Label>
              <Input
                id="userName"
                {...form.register("userName")}
                disabled={isReadOnly}
                placeholder="Full name"
              />
              {form.formState.errors.userName && (
                <p className="text-sm text-destructive">{form.formState.errors.userName.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                {...form.register("email")}
                disabled={isReadOnly}
                placeholder="email@example.com"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                disabled={isReadOnly}
                placeholder="10-digit phone number"
                maxLength={10}
              />
              {form.formState.errors.phone && (
                <p className="text-sm text-destructive">{form.formState.errors.phone.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role *</Label>
              <Select
                disabled={isReadOnly}
                value={form.watch("role")}
                onValueChange={(value) => form.setValue("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.role && (
                <p className="text-sm text-destructive">{form.formState.errors.role.message}</p>
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
                {mode === "add" ? "Add User" : "Update User"}
              </Button>
              <Button type="button" variant="outline" onClick={() => navigate("/users")}>
                Cancel
              </Button>
            </div>
          )}

          {isReadOnly && (
            <div className="flex gap-4 pt-4">
              <Button type="button" onClick={() => navigate(`/users/edit/${id}`)}>
                Edit User
              </Button>
            </div>
          )}
        </form>
      </FormPageLayout>
    </DashboardLayout>
  );
}
