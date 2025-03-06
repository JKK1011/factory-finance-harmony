import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GlassCard } from "@/components/ui/glass-card";
import { Building, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { usersApi } from "@/services/api";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const loginMutation = useMutation({
    mutationFn: async () => {
      try {
        // Call the login API that connects to our in-memory database
        return await usersApi.loginUser(email, password);
      } catch (error) {
        console.error("Login error:", error);
        // Always allow demo login
        if (email === "admin@factoryfinance.com" && password === "password") {
          return { id: 1, email, name: "Admin User" };
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Store user info in localStorage for session management
      localStorage.setItem('user', JSON.stringify(data));
      toast.success("Login successful");
      navigate("/dashboard");
    },
    onError: (error) => {
      toast.error("Invalid credentials. Try admin@factoryfinance.com / password");
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate();
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
                disabled={loginMutation.isPending}
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
                disabled={loginMutation.isPending}
              />
            </div>
            
            <Button type="submit" className="w-full" disabled={loginMutation.isPending}>
              {loginMutation.isPending ? (
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
