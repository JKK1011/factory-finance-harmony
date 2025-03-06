
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/glass-card";
import { Building2, ArrowLeft } from "lucide-react";

const NotFound = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-background via-background to-secondary/30 p-4">
      <GlassCard className="max-w-md w-full text-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-primary/10 text-primary">
            <Building2 className="w-7 h-7" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">404</h1>
            <p className="text-muted-foreground">
              The page you're looking for doesn't exist or has been moved
            </p>
          </div>
          
          <Link to="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return Home
            </Button>
          </Link>
        </div>
      </GlassCard>
    </div>
  );
};

export default NotFound;
