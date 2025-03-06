
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select } from "@/components/ui/select";
import { CreditCard, Loader2, Receipt, Banknote } from "lucide-react";
import { toast } from "sonner";

type TransactionType = 'sale' | 'purchase' | 'payment' | 'receipt' | 'expense';

export function TransactionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<TransactionType>('sale');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} transaction recorded successfully`);
    }, 1000);
  };

  return (
    <Tabs defaultValue="sale" onValueChange={(value) => setActiveTab(value as TransactionType)}>
      <TabsList className="mb-6 w-full grid grid-cols-3 md:grid-cols-5">
        <TabsTrigger value="sale">Sale</TabsTrigger>
        <TabsTrigger value="purchase">Purchase</TabsTrigger>
        <TabsTrigger value="payment">Payment</TabsTrigger>
        <TabsTrigger value="receipt">Receipt</TabsTrigger>
        <TabsTrigger value="expense">Expense</TabsTrigger>
      </TabsList>
      
      <GlassCard>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold capitalize">
                {activeTab === 'sale' && 'New Sale'}
                {activeTab === 'purchase' && 'New Purchase'}
                {activeTab === 'payment' && 'New Payment'}
                {activeTab === 'receipt' && 'New Receipt'}
                {activeTab === 'expense' && 'New Expense'}
              </h2>
              
              <div className="h-10 w-10 rounded-full flex items-center justify-center bg-primary/10 text-primary">
                {activeTab === 'sale' && <Receipt className="h-5 w-5" />}
                {activeTab === 'purchase' && <CreditCard className="h-5 w-5" />}
                {activeTab === 'payment' && <CreditCard className="h-5 w-5" />}
                {activeTab === 'receipt' && <Receipt className="h-5 w-5" />}
                {activeTab === 'expense' && <Banknote className="h-5 w-5" />}
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact">
                    {activeTab === 'sale' && 'Customer'}
                    {activeTab === 'purchase' && 'Supplier'}
                    {activeTab === 'payment' && 'Payee'}
                    {activeTab === 'receipt' && 'Payer'}
                    {activeTab === 'expense' && 'Expense Category'}
                  </Label>
                  <select id="contact" className="w-full border p-2 rounded-md">
                    <option value="">Select...</option>
                    <option value="1">Acme Corporation</option>
                    <option value="2">Global Supplies Inc</option>
                    <option value="3">Tech Solutions Ltd</option>
                    <option value="4">National Bank</option>
                    <option value="5">Smiths Manufacturing</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference/Invoice Number</Label>
                  <Input id="reference" placeholder="e.g., INV-2023-001" />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input id="amount" type="number" step="0.01" min="0" placeholder="0.00" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="payment-method">Payment Method</Label>
                  <select id="payment-method" className="w-full border p-2 rounded-md">
                    <option value="cash">Cash</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="credit-card">Credit Card</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Transaction details..." />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Save Transaction'
              )}
            </Button>
          </div>
        </form>
      </GlassCard>
    </Tabs>
  );
}
