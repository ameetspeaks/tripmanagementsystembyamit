import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { signUpEmailPassword, signInEmailPassword } from "@/services/authService";

type AuthMode = "signin" | "signup";
export function AuthForm() {
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }
    try {
      if (mode === "signup") {
        await signUpEmailPassword(email, password, fullName);
        toast.success("Account created");
      } else {
        await signInEmailPassword(email, password);
        toast.success("Signed in");
      }
      navigate("/trips");
    } catch (e: any) {
      toast.error(e.message || "Authentication failed");
    }
  };

  return (
    <div className="auth-card animate-fade-in">
      {/* Logo */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-3">
          <span className="text-primary-foreground font-bold text-xl">T</span>
        </div>
        <h1 className="text-2xl font-semibold text-foreground">Trip Management System</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Sign in with email and password
        </p>
      </div>

      {/* Mode Tabs */}
      <Tabs value={mode} onValueChange={(v) => setMode(v as AuthMode)} className="mb-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="signin">Sign In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="mb-4" />

      {/* Form */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {mode === "signup" && (
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" type="text" placeholder="Your name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
          </div>
        )}
        <Button variant="auth" onClick={handleSubmit}>
          {mode === "signin" ? <Lock className="w-4 h-4 mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
          {mode === "signin" ? "Sign In" : "Sign Up"}
        </Button>
      </div>
    </div>
  );
}
