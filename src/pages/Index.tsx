
import React from "react";
import { LoginForm } from "@/components/auth/LoginForm";

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 p-4">
      <div className="w-full max-w-md mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Personal Finance Manager</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Track your finances, manage contacts, and record transactions easily
        </p>
      </div>
      <LoginForm />
    </div>
  );
};

export default Index;
