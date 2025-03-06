
import React from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar } from "lucide-react";

const Reports = () => {
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">
          Generate and view financial reports
        </p>
      </div>
      
      <Tabs defaultValue="summary">
        <TabsList className="mb-6">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="receivables">Receivables</TabsTrigger>
          <TabsTrigger value="payables">Payables</TabsTrigger>
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Financial Summary</h2>
                <Button size="sm" variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Revenue</span>
                  <span className="font-medium">$45,250.65</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Expenses</span>
                  <span className="font-medium">$32,480.20</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Net Profit</span>
                  <span className="font-semibold text-emerald-500">$12,770.45</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding Receivables</span>
                  <span className="font-medium">$18,420.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Outstanding Payables</span>
                  <span className="font-medium">$7,850.35</span>
                </div>
              </div>
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Reporting Period: Last 30 days</span>
                  </div>
                  <Button size="sm" variant="link">Change Period</Button>
                </div>
              </div>
            </GlassCard>
            
            <GlassCard>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold">Available Reports</h2>
              </div>
              
              <div className="space-y-4">
                {[
                  "Profit & Loss Statement",
                  "Balance Sheet",
                  "Cash Flow Statement",
                  "Customer Ledger",
                  "Supplier Ledger",
                  "Tax Summary"
                ].map((report, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-md border hover:bg-secondary/50 transition-colors">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 mr-3 text-primary" />
                      <span>{report}</span>
                    </div>
                    <Button size="sm" variant="ghost">Generate</Button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </TabsContent>
        
        <TabsContent value="receivables" className="mt-0">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">Accounts Receivable</h2>
            <p className="text-muted-foreground mb-6">Customer receivables will appear here.</p>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="payables" className="mt-0">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">Accounts Payable</h2>
            <p className="text-muted-foreground mb-6">Supplier and borrower payables will appear here.</p>
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-0">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">Transaction History</h2>
            <p className="text-muted-foreground mb-6">Transaction history will appear here.</p>
          </GlassCard>
        </TabsContent>
      </Tabs>
    </Layout>
  );
};

export default Reports;
