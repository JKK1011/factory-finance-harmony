
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FilePdf, FileText, Loader2 } from "lucide-react";
import { ReportData } from '@/services/reports';

interface ReportViewerProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: ReportData | null;
  isLoading: boolean;
  onDownloadPDF: () => void;
  onDownloadCSV: () => void;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({
  isOpen,
  onClose,
  reportData,
  isLoading,
  onDownloadPDF,
  onDownloadCSV
}) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isLoading 
              ? "Generating Report..." 
              : reportData?.title || "Report Viewer"}
          </DialogTitle>
        </DialogHeader>
        
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-primary" />
            <p className="text-muted-foreground">Processing your report...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-6">
            <div className="text-sm text-muted-foreground">
              Generated on: {reportData.generatedOn}
            </div>
            
            {/* Report content based on type */}
            {reportData.title === 'Profit & Loss Statement' && (
              <ProfitLossReport data={reportData} />
            )}
            
            {reportData.title === 'Balance Sheet' && (
              <BalanceSheetReport data={reportData} />
            )}
            
            {reportData.title === 'Cash Flow Statement' && (
              <CashFlowReport data={reportData} />
            )}
            
            {reportData.title === 'Customer Ledger' && (
              <CustomerLedgerReport data={reportData} />
            )}
            
            {reportData.title === 'Supplier Ledger' && (
              <SupplierLedgerReport data={reportData} />
            )}
            
            {reportData.title === 'Tax Summary' && (
              <TaxSummaryReport data={reportData} />
            )}
          </div>
        ) : (
          <p className="text-muted-foreground py-8 text-center">
            No report data available.
          </p>
        )}
        
        <DialogFooter className="gap-2">
          <Button
            onClick={onDownloadCSV}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isLoading || !reportData}
          >
            <FileText className="h-4 w-4" />
            Download CSV
          </Button>
          <Button
            onClick={onDownloadPDF}
            variant="outline"
            size="sm"
            className="gap-2"
            disabled={isLoading || !reportData}
          >
            <FilePdf className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Report type components
const ProfitLossReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-2">Period</h3>
      <p>{data.data.period}</p>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mb-2">Revenue</h3>
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-2 px-4">Category</th>
            <th className="text-right py-2 px-4">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.data.revenueItems.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-muted/30">
              <td className="py-2 px-4">{item.category}</td>
              <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="font-medium bg-muted/20">
            <td className="py-2 px-4">Total Revenue</td>
            <td className="py-2 px-4 text-right text-emerald-500">
              ${data.summary?.totalRevenue.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mb-2">Expenses</h3>
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-2 px-4">Category</th>
            <th className="text-right py-2 px-4">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.data.expenseItems.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-muted/30">
              <td className="py-2 px-4">{item.category}</td>
              <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="font-medium bg-muted/20">
            <td className="py-2 px-4">Total Expenses</td>
            <td className="py-2 px-4 text-right text-rose-500">
              ${data.summary?.totalExpenses.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium mb-2">Summary</h3>
      <div className="flex justify-between items-center px-4 py-3 bg-muted/30 rounded-md">
        <span className="font-medium">Net Profit</span>
        <span className={`font-bold text-xl ${
          data.summary?.netProfit >= 0 ? 'text-emerald-500' : 'text-rose-500'
        }`}>
          ${data.summary?.netProfit.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);

const BalanceSheetReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-2">Assets</h3>
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-2 px-4">Asset</th>
            <th className="text-right py-2 px-4">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.data.assets.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-muted/30">
              <td className="py-2 px-4">{item.name}</td>
              <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="font-medium bg-muted/20">
            <td className="py-2 px-4">Total Assets</td>
            <td className="py-2 px-4 text-right text-emerald-500">
              ${data.summary?.totalAssets.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mb-2">Liabilities</h3>
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left py-2 px-4">Liability</th>
            <th className="text-right py-2 px-4">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {data.data.liabilities.map((item: any, index: number) => (
            <tr key={index} className="hover:bg-muted/30">
              <td className="py-2 px-4">{item.name}</td>
              <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
            </tr>
          ))}
          <tr className="font-medium bg-muted/20">
            <td className="py-2 px-4">Total Liabilities</td>
            <td className="py-2 px-4 text-right text-rose-500">
              ${data.summary?.totalLiabilities.toFixed(2)}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium mb-2">Equity</h3>
      <div className="flex justify-between items-center px-4 py-3 bg-muted/30 rounded-md">
        <span className="font-medium">Total Equity</span>
        <span className="font-bold text-xl text-primary">
          ${data.summary?.equity.toFixed(2)}
        </span>
      </div>
    </div>
  </div>
);

const CashFlowReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-2">Period</h3>
      <p>{data.data.period}</p>
    </div>
    
    {data.data.sections.map((section: any, idx: number) => (
      <div key={idx}>
        <h3 className="text-lg font-medium mb-2">{section.title}</h3>
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left py-2 px-4">Item</th>
              <th className="text-right py-2 px-4">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {section.items.map((item: any, index: number) => (
              <tr key={index} className="hover:bg-muted/30">
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4 text-right">${item.amount.toFixed(2)}</td>
              </tr>
            ))}
            <tr className="font-medium bg-muted/20">
              <td className="py-2 px-4">Total {section.title}</td>
              <td className="py-2 px-4 text-right">
                ${section.total.toFixed(2)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ))}
    
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium mb-2">Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center px-4 py-2 bg-muted/20 rounded-md">
          <span>Net Cash Flow</span>
          <span className={`font-medium ${
            data.summary?.netCashFlow >= 0 ? 'text-emerald-500' : 'text-rose-500'
          }`}>
            ${data.summary?.netCashFlow.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 bg-muted/30 rounded-md">
          <span className="font-medium">Ending Cash Balance</span>
          <span className="font-bold text-xl text-primary">
            ${data.summary?.endingCashBalance.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </div>
);

const CustomerLedgerReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-2">Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/20 p-4 rounded-md">
          <span className="block text-sm text-muted-foreground">Total Customers</span>
          <span className="block text-2xl font-bold">{data.summary?.totalCustomers}</span>
        </div>
        <div className="bg-muted/20 p-4 rounded-md">
          <span className="block text-sm text-muted-foreground">Total Receivables</span>
          <span className="block text-2xl font-bold text-emerald-500">
            ${data.summary?.totalReceivables.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
    
    {data.data.customers.map((customer: any) => (
      <div key={customer.id} className="border rounded-md overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium">{customer.name}</h3>
          <span className={`font-medium ${
            customer.balance > 0 ? 'text-emerald-500' : 'text-muted-foreground'
          }`}>
            Balance: ${customer.balance.toFixed(2)}
          </span>
        </div>
        
        {customer.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/10">
                <tr>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Reference</th>
                  <th className="text-right py-2 px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {customer.transactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-muted/10">
                    <td className="py-2 px-4">{txn.date}</td>
                    <td className="py-2 px-4 capitalize">{txn.type}</td>
                    <td className="py-2 px-4">{txn.reference}</td>
                    <td className="py-2 px-4 text-right">
                      ${txn.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground p-4 text-center">No transactions found.</p>
        )}
      </div>
    ))}
  </div>
);

const SupplierLedgerReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-2">Summary</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-muted/20 p-4 rounded-md">
          <span className="block text-sm text-muted-foreground">Total Suppliers</span>
          <span className="block text-2xl font-bold">{data.summary?.totalSuppliers}</span>
        </div>
        <div className="bg-muted/20 p-4 rounded-md">
          <span className="block text-sm text-muted-foreground">Total Payables</span>
          <span className="block text-2xl font-bold text-rose-500">
            ${data.summary?.totalPayables.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
    
    {data.data.suppliers.map((supplier: any) => (
      <div key={supplier.id} className="border rounded-md overflow-hidden">
        <div className="bg-muted/30 px-4 py-3 flex justify-between items-center">
          <h3 className="font-medium">{supplier.name}</h3>
          <span className={`font-medium ${
            supplier.balance < 0 ? 'text-rose-500' : 'text-muted-foreground'
          }`}>
            Balance: ${Math.abs(supplier.balance).toFixed(2)}
          </span>
        </div>
        
        {supplier.transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/10">
                <tr>
                  <th className="text-left py-2 px-4">Date</th>
                  <th className="text-left py-2 px-4">Type</th>
                  <th className="text-left py-2 px-4">Reference</th>
                  <th className="text-right py-2 px-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {supplier.transactions.map((txn: any) => (
                  <tr key={txn.id} className="hover:bg-muted/10">
                    <td className="py-2 px-4">{txn.date}</td>
                    <td className="py-2 px-4 capitalize">{txn.type}</td>
                    <td className="py-2 px-4">{txn.reference}</td>
                    <td className="py-2 px-4 text-right">
                      ${txn.amount.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-muted-foreground p-4 text-center">No transactions found.</p>
        )}
      </div>
    ))}
  </div>
);

const TaxSummaryReport: React.FC<{ data: ReportData }> = ({ data }) => (
  <div className="space-y-6">
    <div>
      <h3 className="text-lg font-medium mb-2">Period</h3>
      <p>{data.data.period}</p>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mb-2">Income</h3>
      <table className="w-full">
        <tbody className="divide-y">
          <tr className="hover:bg-muted/30">
            <td className="py-2 px-4">Total Revenue</td>
            <td className="py-2 px-4 text-right">${data.data.revenue.totalRevenue.toFixed(2)}</td>
          </tr>
          <tr className="hover:bg-muted/30">
            <td className="py-2 px-4">Taxable Revenue</td>
            <td className="py-2 px-4 text-right">${data.data.revenue.taxableRevenue.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div>
      <h3 className="text-lg font-medium mb-2">Expenses</h3>
      <table className="w-full">
        <tbody className="divide-y">
          <tr className="hover:bg-muted/30">
            <td className="py-2 px-4">Total Expenses</td>
            <td className="py-2 px-4 text-right">${data.data.expenses.totalExpenses.toFixed(2)}</td>
          </tr>
          <tr className="hover:bg-muted/30">
            <td className="py-2 px-4">Deductible Expenses</td>
            <td className="py-2 px-4 text-right">${data.data.expenses.deductibleExpenses.toFixed(2)}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium mb-2">Tax Summary</h3>
      <div className="space-y-2">
        <div className="flex justify-between items-center px-4 py-2 bg-muted/20 rounded-md">
          <span>Taxable Income</span>
          <span className="font-medium">
            ${data.summary?.taxableIncome.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between items-center px-4 py-3 bg-muted/30 rounded-md">
          <span className="font-medium">Estimated Tax</span>
          <span className="font-bold text-xl text-rose-500">
            ${data.summary?.estimatedTax.toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  </div>
);
