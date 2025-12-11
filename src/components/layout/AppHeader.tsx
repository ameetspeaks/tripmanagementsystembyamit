import { Route } from "lucide-react";

export function AppHeader() {
  return (
    <header className="h-16 border-b bg-background flex items-center px-6 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <span className="text-primary-foreground font-bold text-sm">T</span>
        </div>
        <h1 className="font-semibold text-lg text-foreground">Trip Management System</h1>
      </div>
    </header>
  );
}
