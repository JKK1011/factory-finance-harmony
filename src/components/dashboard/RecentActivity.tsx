
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  CreditCard, 
  BadgeDollarSign,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useQuery } from "@tanstack/react-query";
import { transactionsApi } from "@/services/api";
import { Link } from "react-router-dom";

type ActivityType = 'sale' | 'purchase' | 'payment' | 'receipt' | 'expense';

interface ActivityItem {
  id: string | number;
  type: ActivityType;
  amount: number;
  date: string;
  contact: string;
  description: string;
}

interface IconProps {
  type: ActivityType;
}

function ActivityIcon({ type }: IconProps) {
  switch (type) {
    case 'sale':
      return <ArrowUpRight className="h-4 w-4 text-emerald-500" />;
    case 'purchase':
      return <ShoppingCart className="h-4 w-4 text-rose-500" />;
    case 'payment':
      return <ArrowDownRight className="h-4 w-4 text-amber-500" />;
    case 'receipt':
      return <CreditCard className="h-4 w-4 text-blue-500" />;
    case 'expense':
      return <BadgeDollarSign className="h-4 w-4 text-purple-500" />;
    default:
      return <BadgeDollarSign className="h-4 w-4" />;
  }
}

function getTypeLabel(type: ActivityType): string {
  switch (type) {
    case 'sale': return 'Sale';
    case 'purchase': return 'Purchase';
    case 'payment': return 'Payment';
    case 'receipt': return 'Receipt';
    case 'expense': return 'Expense';
    default: return 'Transaction';
  }
}

export function RecentActivity() {
  // Fetch recent transactions
  const { data: recentTransactions = [], isLoading } = useQuery({
    queryKey: ['transactions', 'recent'],
    queryFn: transactionsApi.getRecentTransactions
  });

  const recentActivity: ActivityItem[] = recentTransactions.map((transaction: any) => ({
    id: transaction.id,
    type: transaction.type as ActivityType,
    amount: transaction.amount,
    date: transaction.date,
    contact: transaction.contactName || 'Unknown',
    description: transaction.description || ''
  }));

  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Button variant="outline" size="sm" asChild>
          <Link to="/transactions">View All</Link>
        </Button>
      </div>
      
      <div className="space-y-4">
        {isLoading ? (
          <div className="py-8 flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
            <p className="text-sm text-muted-foreground">Loading transactions...</p>
          </div>
        ) : recentActivity.length > 0 ? (
          recentActivity.map((activity, index) => (
            <React.Fragment key={activity.id}>
              <div className="flex items-start">
                <div className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary">
                  <ActivityIcon type={activity.type} />
                </div>
                
                <div className="ml-4 flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <p className="font-medium">{activity.contact}</p>
                    <p className={`font-medium ${activity.type === 'sale' || activity.type === 'receipt' ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {activity.type === 'sale' || activity.type === 'receipt' ? '+' : '-'}
                      ${activity.amount.toFixed(2)}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <span>{getTypeLabel(activity.type)}</span>
                      <span>•</span>
                      <span>{activity.description}</span>
                    </div>
                    <time dateTime={activity.date}>
                      {new Date(activity.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </time>
                  </div>
                </div>
              </div>
              
              {index < recentActivity.length - 1 && (
                <Separator className="my-3" />
              )}
            </React.Fragment>
          ))
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground mb-4">No transactions recorded yet</p>
            <Button asChild>
              <Link to="/transactions">Add Your First Transaction</Link>
            </Button>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
