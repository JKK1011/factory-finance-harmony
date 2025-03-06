
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Building, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      
      // Demo login - in a real app, this would validate credentials against a backend
      if (email === "admin@factoryfinance.com" && password === "password") {
        toast.success("Login successful");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials. Try admin@factoryfinance.com / password");
      }
    }, 1500);
  };

  return (
    <div className="animate-scale-in">
      <GlassCard className="w-full max-w-md mx-auto">
        <div className="flex flex-col items-center space-y-6 text-center">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
            <Building className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-semibold tracking-tight">Factory Finance Manager</h1>
            <p className="text-sm text-muted-foreground">
              Enter your credentials to access your account
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="w-full space-y-4">
            <div className="space-y-2 text-left">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email" 
                type="email" 
                placeholder="admin@factoryfinance.com" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2 text-left">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <Input 
                id="password" 
                type="password" 
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="text-xs text-muted-foreground">
            Demo credentials: admin@factoryfinance.com / password
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
