
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const monthlyData = [
  { name: "Jan", sales: 4000, expenses: 2400 },
  { name: "Feb", sales: 5000, expenses: 2800 },
  { name: "Mar", sales: 3500, expenses: 2200 },
  { name: "Apr", sales: 6000, expenses: 2600 },
  { name: "May", sales: 7000, expenses: 3000 },
];

const categoryData = [
  { name: "Raw Materials", value: 45 },
  { name: "Labor", value: 25 },
  { name: "Equipment", value: 15 },
  { name: "Utilities", value: 10 },
  { name: "Other", value: 5 },
];

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const Analytics = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Visualize and analyze your financial data
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Monthly Performance</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={monthlyData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
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
                <Legend />
                <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="expenses" fill="#f43f5e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        
        <GlassCard>
          <h2 className="text-xl font-semibold mb-4">Expense Breakdown</h2>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  fill="#8884d8"
                  paddingAngle={2}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(255, 255, 255, 0.8)', 
                    backdropFilter: 'blur(8px)',
                    borderRadius: '0.5rem',
                    border: '1px solid hsl(var(--border))',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                  }} 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        
        <GlassCard className="lg:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col items-center justify-center p-4 bg-primary/5 rounded-lg">
              <span className="text-4xl font-bold text-primary">28%</span>
              <span className="text-sm text-muted-foreground mt-2">Profit Margin</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-emerald-500/5 rounded-lg">
              <span className="text-4xl font-bold text-emerald-500">12%</span>
              <span className="text-sm text-muted-foreground mt-2">Revenue Growth</span>
            </div>
            <div className="flex flex-col items-center justify-center p-4 bg-amber-500/5 rounded-lg">
              <span className="text-4xl font-bold text-amber-500">4.2x</span>
              <span className="text-sm text-muted-foreground mt-2">ROI</span>
            </div>
          </div>
        </GlassCard>
      </div>
    </Layout>
  );
};

export default Analytics;
