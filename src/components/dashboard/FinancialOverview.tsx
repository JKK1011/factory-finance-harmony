
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { 
  ArrowUpRight, 
  ArrowDownRight,
  Landmark, 
  DollarSign,
  CreditCard,
  TrendingDown,
  Loader2
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { financeApi } from "@/services/api";

interface MetricCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  prefix?: string;
  suffix?: string;
  isLoading?: boolean;
}

function MetricCard({ title, value, change, icon, prefix = "", suffix = "", isLoading = false }: MetricCardProps) {
  const isPositive = change >= 0;
  
  return (
    <GlassCard className="h-full">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          {isLoading ? (
            <div className="h-8 flex items-center mt-1">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <h3 className="text-2xl font-bold mt-1 tracking-tight">
              <AnimatedCounter 
                value={value} 
                prefix={prefix} 
                suffix={suffix} 
                decimals={2} 
              />
            </h3>
          )}
        </div>
        <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
          {icon}
        </div>
      </div>
      {!isLoading && (
        <div className="mt-4 flex items-center text-sm">
          <span className={`flex items-center ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
            {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
            {Math.abs(change)}%
          </span>
          <span className="text-muted-foreground ml-2">from last month</span>
        </div>
      )}
    </GlassCard>
  );
}

export function FinancialOverview() {
  // Fetch financial overview data
  const { data: financialData, isLoading } = useQuery({
    queryKey: ['financial-overview'],
    queryFn: financeApi.getFinancialOverview
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Cash Balance"
        value={financialData?.cashBalance || 0}
        change={financialData?.cashChange || 0}
        icon={<DollarSign className="h-5 w-5" />}
        prefix="$"
        isLoading={isLoading}
      />
      <MetricCard
        title="Bank Balance"
        value={financialData?.bankBalance || 0}
        change={financialData?.bankChange || 0}
        icon={<CreditCard className="h-5 w-5" />}
        prefix="$"
        isLoading={isLoading}
      />
      <MetricCard
        title="Receivables"
        value={financialData?.receivables || 0}
        change={financialData?.receivablesChange || 0}
        icon={<Landmark className="h-5 w-5" />}
        prefix="$"
        isLoading={isLoading}
      />
      <MetricCard
        title="Payables"
        value={financialData?.payables || 0}
        change={financialData?.payablesChange || 0}
        icon={<TrendingDown className="h-5 w-5" />}
        prefix="$"
        isLoading={isLoading}
      />
    </div>
  );
}
