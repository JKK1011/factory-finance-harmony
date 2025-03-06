
import React, { useState } from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";
import { transactionsApi } from "@/services/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Search, Plus, MoreVertical, FileText, Receipt, CreditCard, BadgeDollarSign, ShoppingCart, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { toast } from "sonner";

interface TransactionListProps {
  onAddNew: () => void;
}

export function TransactionList({ onAddNew }: TransactionListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const queryClient = useQueryClient();
  
  // Fetch transactions
  const { data: transactions = [], isLoading, isError } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getTransactions
  });
  
  // Delete transaction mutation
  const deleteTransactionMutation = useMutation({
    mutationFn: transactionsApi.deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      toast.success("Transaction deleted successfully");
    },
    onError: (error) => {
      toast.error(`Error deleting transaction: ${error.message}`);
    }
  });

  // Filter transactions based on search query
  const filteredTransactions = transactions.filter((transaction: any) => {
    const searchFields = [
      transaction.description,
      transaction.reference,
      transaction.contactName,
      transaction.type,
      transaction.paymentMethod
    ];
    
    return searchFields.some(field => 
      field && field.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const handleViewDetails = (id: string | number) => {
    toast.info(`Viewing details for transaction ${id}`);
  };

  const handleDelete = (id: string | number) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransactionMutation.mutate(id.toString());
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sale': return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
      case 'purchase': return <ShoppingCart className="h-4 w-4 text-rose-500" />;
      case 'payment': return <ArrowDownRight className="h-4 w-4 text-amber-500" />;
      case 'receipt': return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'expense': return <BadgeDollarSign className="h-4 w-4 text-purple-500" />;
      default: return <Receipt className="h-4 w-4" />;
    }
  };

  const getTransactionType = (type: string) => {
    const types: Record<string, string> = {
      'sale': 'Sale',
      'purchase': 'Purchase',
      'payment': 'Payment',
      'receipt': 'Receipt',
      'expense': 'Expense'
    };
    return types[type] || type;
  };

  if (isError) {
    return (
      <GlassCard>
        <div className="p-8 text-center">
          <p className="text-destructive">Error loading transactions. Please try again later.</p>
        </div>
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <Button onClick={onAddNew}>
          <Plus className="h-4 w-4 mr-2" />
          Add Transaction
        </Button>
      </div>
      
      <GlassCard className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading transactions...</p>
          </div>
        ) : filteredTransactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left py-3 px-4 font-medium">Date</th>
                  <th className="text-left py-3 px-4 font-medium">Type</th>
                  <th className="text-left py-3 px-4 font-medium">Contact</th>
                  <th className="text-left py-3 px-4 font-medium">Description</th>
                  <th className="text-left py-3 px-4 font-medium">Reference</th>
                  <th className="text-right py-3 px-4 font-medium">Amount</th>
                  <th className="py-3 px-4 font-medium w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredTransactions.map((transaction: any) => (
                  <tr key={transaction.id} className="hover:bg-muted/30">
                    <td className="py-3 px-4">
                      {format(new Date(transaction.date), 'MMM d, yyyy')}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center">
                        <div className="h-7 w-7 rounded-full flex items-center justify-center bg-secondary mr-2">
                          {getTransactionIcon(transaction.type)}
                        </div>
                        <span>{getTransactionType(transaction.type)}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">{transaction.contactName}</td>
                    <td className="py-3 px-4">{transaction.description}</td>
                    <td className="py-3 px-4">{transaction.reference}</td>
                    <td className={`py-3 px-4 text-right font-medium ${
                      transaction.type === 'sale' || transaction.type === 'receipt' 
                        ? 'text-emerald-500' 
                        : 'text-rose-500'
                    }`}>
                      {transaction.type === 'sale' || transaction.type === 'receipt' ? '+' : '-'}
                      ${transaction.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleViewDetails(transaction.id)}>
                            <FileText className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive" 
                            onClick={() => handleDelete(transaction.id)}
                            disabled={deleteTransactionMutation.isPending}
                          >
                            {deleteTransactionMutation.isPending && transaction.id === deleteTransactionMutation.variables ? 
                              'Deleting...' : 'Delete'}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <p className="text-muted-foreground mb-4">No transactions found</p>
            <Button onClick={onAddNew}>Add Your First Transaction</Button>
          </div>
        )}
      </GlassCard>
    </div>
  );
}
