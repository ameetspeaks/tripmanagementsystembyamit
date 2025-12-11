import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface FormPageLayoutProps {
  title: string;
  backUrl: string;
  children: ReactNode;
  mode: "add" | "view" | "edit";
}

export function FormPageLayout({ title, backUrl, children, mode }: FormPageLayoutProps) {
  const navigate = useNavigate();

  const modeLabel = mode === "add" ? "Add" : mode === "edit" ? "Edit" : "View";

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Button
          variant="ghost"
          onClick={() => navigate(backUrl)}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <h1 className="page-title">{modeLabel} {title}</h1>
      </div>

      <div className="bg-card border rounded-lg p-6 max-w-2xl">
        {children}
      </div>
    </div>
  );
}
