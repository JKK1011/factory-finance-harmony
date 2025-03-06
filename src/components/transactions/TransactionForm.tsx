
import React, { useState, useEffect } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreditCard, Loader2, Receipt, Banknote } from "lucide-react";
import { toast } from "sonner";
import { transactionsApi, contactsApi, Contact as ApiContact } from "@/services/api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

type TransactionType = 'sale' | 'purchase' | 'payment' | 'receipt' | 'expense';

// Define a local Contact interface that ensures id is always treated as string
interface Contact {
  id: string;
  name: string;
  type: string;
}

interface TransactionFormProps {
  onSuccess?: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const [activeTab, setActiveTab] = useState<TransactionType>('sale');
  const [transaction, setTransaction] = useState({
    type: 'sale' as TransactionType,
    amount: '',
    date: new Date().toISOString().split('T')[0],
    contactId: '',
    reference: '',
    paymentMethod: 'cash',
    description: ''
  });
  
  const queryClient = useQueryClient();
  
  // Fetch contacts for dropdown
  const { data: contactsData = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getContacts
  });
  
  // Convert ApiContact to local Contact interface, ensuring id is string
  const contacts: Contact[] = contactsData.map((contact: ApiContact) => ({
    id: String(contact.id),
    name: contact.name,
    type: contact.type
  }));
  
  // Add transaction mutation
  const addTransactionMutation = useMutation({
    mutationFn: transactionsApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['transactions', 'recent'] });
      queryClient.invalidateQueries({ queryKey: ['financial-overview'] });
      toast.success(`${activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} transaction recorded successfully`);
      resetForm();
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: (error) => {
      toast.error(`Error recording transaction: ${error.message}`);
    }
  });
  
  useEffect(() => {
    // Update transaction type when tab changes
    setTransaction(prev => ({ ...prev, type: activeTab }));
  }, [activeTab]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!transaction.amount || !transaction.date || !transaction.contactId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // Convert amount to number
    const payload = {
      ...transaction,
      amount: parseFloat(transaction.amount)
    };
    
    addTransactionMutation.mutate(payload);
  };
  
  const resetForm = () => {
    setTransaction({
      type: activeTab,
      amount: '',
      date: new Date().toISOString().split('T')[0],
      contactId: '',
      reference: '',
      paymentMethod: 'cash',
      description: ''
    });
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setTransaction(prev => ({
      ...prev,
      [id]: value
    }));
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
                  <Input 
                    id="date" 
                    type="date" 
                    value={transaction.date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contactId">
                    {activeTab === 'sale' && 'Customer'}
                    {activeTab === 'purchase' && 'Supplier'}
                    {activeTab === 'payment' && 'Payee'}
                    {activeTab === 'receipt' && 'Payer'}
                    {activeTab === 'expense' && 'Expense Category'}
                  </Label>
                  <select 
                    id="contactId" 
                    className="w-full border p-2 rounded-md"
                    value={transaction.contactId}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select...</option>
                    {contacts.map((contact: Contact) => (
                      <option key={contact.id} value={contact.id}>
                        {contact.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference/Invoice Number</Label>
                  <Input 
                    id="reference" 
                    placeholder="e.g., INV-2023-001" 
                    value={transaction.reference}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="amount">Amount ($)</Label>
                  <Input 
                    id="amount" 
                    type="number" 
                    step="0.01" 
                    min="0" 
                    placeholder="0.00" 
                    value={transaction.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Payment Method</Label>
                  <select 
                    id="paymentMethod" 
                    className="w-full border p-2 rounded-md"
                    value={transaction.paymentMethod}
                    onChange={handleInputChange}
                  >
                    <option value="cash">Cash</option>
                    <option value="bank-transfer">Bank Transfer</option>
                    <option value="check">Check</option>
                    <option value="credit-card">Credit Card</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Transaction details..." 
                    value={transaction.description}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={resetForm}>
              Cancel
            </Button>
            <Button type="submit" disabled={addTransactionMutation.isPending}>
              {addTransactionMutation.isPending ? (
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
