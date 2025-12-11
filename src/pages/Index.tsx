import { AuthForm } from "@/components/auth/AuthForm";
import { DashboardLayout } from "@/components/layout/DashboardLayout";

const Index = () => {
  return (
    <div className="flex min-h-screen">
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <AuthForm />
        </div>
      </DashboardLayout>
    </div>
  );
};

export default Index;
