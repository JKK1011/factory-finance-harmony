
import React from "react";
import { GlassCard } from "@/components/ui/glass-card";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  ShoppingCart, 
  CreditCard, 
  BadgeDollarSign, 
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type ActivityType = 'sale' | 'purchase' | 'payment' | 'receipt';

interface ActivityItem {
  id: string;
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
    default: return 'Transaction';
  }
}

const recentActivity: ActivityItem[] = [
  {
    id: '1',
    type: 'sale',
    amount: 1250.00,
    date: '2023-05-15',
    contact: 'Acme Corp',
    description: 'Monthly product delivery'
  },
  {
    id: '2',
    type: 'purchase',
    amount: 450.75,
    date: '2023-05-14',
    contact: 'Global Supplies Inc',
    description: 'Raw materials'
  },
  {
    id: '3',
    type: 'payment',
    amount: 320.00,
    date: '2023-05-12',
    contact: 'National Bank',
    description: 'Loan payment'
  },
  {
    id: '4',
    type: 'receipt',
    amount: 2450.50,
    date: '2023-05-10',
    contact: 'Tech Solutions Ltd',
    description: 'Invoice #INV-2023-042'
  },
  {
    id: '5',
    type: 'sale',
    amount: 780.25,
    date: '2023-05-08',
    contact: 'Smiths Manufacturing',
    description: 'Custom order #CM-458'
  }
];

export function RecentActivity() {
  return (
    <GlassCard>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Recent Activity</h2>
        <Button variant="outline" size="sm">View All</Button>
      </div>
      
      <div className="space-y-4">
        {recentActivity.map((activity, index) => (
          <React.Fragment key={activity.id}>
            <div className="flex items-start">
              <div className="h-8 w-8 rounded-full flex items-center justify-center bg-secondary">
                <ActivityIcon type={activity.type} />
              </div>
              
              <div className="ml-4 flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium">{activity.contact}</p>
                  <p className="font-medium">
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
        ))}
      </div>
    </GlassCard>
  );
}
