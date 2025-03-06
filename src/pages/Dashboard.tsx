
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { FinancialOverview } from "@/components/dashboard/FinancialOverview";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { GlassCard } from "@/components/ui/glass-card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react";

const data = [
  { name: "Jan", revenue: 4000, expenses: 2400 },
  { name: "Feb", revenue: 5000, expenses: 2800 },
  { name: "Mar", revenue: 3500, expenses: 2200 },
  { name: "Apr", revenue: 6000, expenses: 2600 },
  { name: "May", revenue: 7000, expenses: 3000 },
];

const Dashboard = () => {
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
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
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
