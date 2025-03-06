
import React from "react";
import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  elevated?: boolean;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ children, className, elevated = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "glass-card p-6",
          elevated ? "shadow-elevated" : "shadow-glass",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
