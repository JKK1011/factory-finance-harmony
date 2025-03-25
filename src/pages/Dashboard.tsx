
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { GlassCard } from "@/components/ui/glass-card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/services/api";

const Dashboard = () => {
  // Fetch transactions data for chart
  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getTransactions
  });

  // Compute monthly summaries for chart
  const chartData = React.useMemo(() => {
    if (!transactions.length) return [];
    
    const monthlyData: Record<string, { name: string, revenue: number, expenses: number }> = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize with last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthName = date.toLocaleString('default', { month: 'short' });
      monthlyData[`${date.getFullYear()}-${date.getMonth()}`] = {
        name: monthName,
        revenue: 0,
        expenses: 0
      };
    }
    
    // Aggregate transaction data
    transactions.forEach((transaction: any) => {
      const date = new Date(transaction.date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      
      // Only include current year data
      if (date.getFullYear() !== currentYear) return;
      
      // Skip if not in our month range
      if (!monthlyData[key]) return;
      
      if (transaction.type === 'sale' || transaction.type === 'receipt') {
        monthlyData[key].revenue += transaction.amount;
      } else if (transaction.type === 'purchase' || transaction.type === 'payment' || transaction.type === 'expense') {
        monthlyData[key].expenses += transaction.amount;
      }
    });
    
    return Object.values(monthlyData);
  }, [transactions]);

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your financial data and recent activity
        </p>
      </div>
      
      <div className="space-y-6">
        <FinancialOverview />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Revenue vs Expenses</h2>
                <button className="text-sm text-primary flex items-center hover:underline">
                  View Report <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              
              {isLoading ? (
                <div className="h-80 flex items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : chartData.length > 0 ? (
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                          backdropFilter: 'blur(8px)',
                          borderRadius: '0.5rem',
                          border: '1px solid hsl(var(--border))',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorRevenue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="expenses"
                        stroke="#f43f5e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorExpenses)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="h-80 flex items-center justify-center">
                  <p className="text-muted-foreground">No transaction data available</p>
                </div>
              )}
            </GlassCard>
          </div>
          
          <div>
            <RecentActivity />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
