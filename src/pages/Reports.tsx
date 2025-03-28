import React, { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Download, Calendar, Loader2, File } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { financeApi, transactionsApi, contactsApi } from "@/services/api";
import { format } from "date-fns";
import { toast } from "sonner";
import { ReportViewer } from "@/components/reports/ReportViewer";
import { reportsService, ReportData } from "@/services/reports";

const Reports = () => {
  const [reportPeriod, setReportPeriod] = useState("30");
  const [currentReport, setCurrentReport] = useState<ReportData | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);
  
  // Fetch financial overview
  const { data: financialData, isLoading: isLoadingFinancial } = useQuery({
    queryKey: ['financial-overview'],
    queryFn: financeApi.getFinancialOverview
  });
  
  // Fetch transactions
  const { data: transactions = [], isLoading: isLoadingTransactions } = useQuery({
    queryKey: ['transactions'],
    queryFn: transactionsApi.getTransactions
  });
  
  // Fetch contacts
  const { data: customers = [], isLoading: isLoadingCustomers } = useQuery({
    queryKey: ['contacts', 'customer'],
    queryFn: () => contactsApi.getContactsByType('customer')
  });
  
  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['contacts', 'supplier'],
    queryFn: () => contactsApi.getContactsByType('supplier')
  });

  const handleExport = (reportType: string) => {
    // Generate report first, then export
    generateReport(reportType, true);
  };
  
  const generateReport = async (reportType: string, exportAfter: boolean = false) => {
    setIsGeneratingReport(true);
    
    try {
      let reportData: ReportData | null = null;
      
      // Generate the appropriate report based on type
      switch (reportType) {
        case "Profit & Loss Statement":
          reportData = await reportsService.generateProfitLossStatement(reportPeriod);
          break;
        case "Balance Sheet":
          reportData = await reportsService.generateBalanceSheet();
          break;
        case "Cash Flow Statement":
          reportData = await reportsService.generateCashFlowStatement(reportPeriod);
          break;
        case "Customer Ledger":
          reportData = await reportsService.generateCustomerLedger();
          break;
        case "Supplier Ledger":
          reportData = await reportsService.generateSupplierLedger();
          break;
        case "Tax Summary":
          reportData = await reportsService.generateTaxSummary(reportPeriod);
          break;
        default:
          throw new Error("Invalid report type");
      }
      
      setCurrentReport(reportData);
      
      if (exportAfter) {
        // If export was requested, automatically download
        downloadPdf(reportData);
      } else {
        // Otherwise show the report
        setIsReportModalOpen(true);
      }
      
      toast.success(`${reportType} generated successfully.`);
    } catch (error) {
      console.error("Error generating report:", error);
      toast.error(`Error generating ${reportType}.`);
    } finally {
      setIsGeneratingReport(false);
    }
  };
  
  const handleChangePeriod = () => {
    // In a real app, this would show a date picker
    const periods: Record<string, string> = {
      "30": "7",
      "7": "90",
      "90": "365",
      "365": "30"
    };
    
    setReportPeriod(periods[reportPeriod] || "30");
    toast.info(`Reporting period changed to ${periods[reportPeriod] || "30"} days`);
  };
  
  const downloadPdf = async (reportData: ReportData | null) => {
    if (!reportData) return;
    
    try {
      const pdfBlob = await reportsService.exportToPDF(reportData);
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.title.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${reportData.title} exported as PDF.`);
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Error exporting PDF. Please try again.');
    }
  };
  
  const downloadCsv = (reportData: ReportData | null) => {
    if (!reportData) return;
    
    try {
      const csvContent = reportsService.exportToCSV(reportData);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${reportData.title.replace(/\s+/g, '_')}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`${reportData.title} exported as CSV.`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      toast.error('Error exporting CSV. Please try again.');
    }
  };

  const isLoading = isLoadingFinancial || isLoadingTransactions || isLoadingCustomers || isLoadingSuppliers;
  
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
                <Button size="sm" variant="outline" onClick={() => handleExport("Financial Summary")}>
                  <Download className="h-4 w-4 mr-2" />
                  Export
                </Button>
              </div>
              
              {isLoading ? (
                <div className="py-8 flex flex-col items-center justify-center">
                  <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                  <p className="text-sm text-muted-foreground">Loading financial data...</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cash Balance</span>
                    <span className="font-medium">${financialData?.cashBalance.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bank Balance</span>
                    <span className="font-medium">${financialData?.bankBalance.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Balance</span>
                    <span className="font-semibold text-emerald-500">
                      ${((financialData?.cashBalance || 0) + (financialData?.bankBalance || 0)).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Outstanding Receivables</span>
                    <span className="font-medium">${financialData?.receivables.toFixed(2) || "0.00"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Transactions</span>
                    <span className="font-medium">{financialData?.transactionsCount || 0}</span>
                  </div>
                </div>
              )}
              
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Reporting Period: Last {reportPeriod} days</span>
                  </div>
                  <Button size="sm" variant="link" onClick={handleChangePeriod}>Change Period</Button>
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
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => generateReport(report)}
                        disabled={isGeneratingReport}
                      >
                        {isGeneratingReport ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Generate
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleExport(report)}
                        disabled={isGeneratingReport}
                      >
                        <FilePdf className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        </TabsContent>
        
        <TabsContent value="receivables" className="mt-0">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Accounts Receivable</h2>
              <Button size="sm" variant="outline" onClick={() => handleExport("Receivables")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {isLoadingCustomers ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading customer data...</p>
              </div>
            ) : customers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Customer</th>
                      <th className="text-left py-3 px-4 font-medium">Contact Person</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-right py-3 px-4 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {customers.map((customer: any) => (
                      <tr key={customer.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">{customer.name}</td>
                        <td className="py-3 px-4">{customer.contactPerson || customer.contact_person || '-'}</td>
                        <td className="py-3 px-4">{customer.email || '-'}</td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          customer.balance > 0 ? 'text-emerald-500' : 'text-rose-500'
                        }`}>
                          ${customer.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No customer receivables found.</p>
            )}
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="payables" className="mt-0">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Accounts Payable</h2>
              <Button size="sm" variant="outline" onClick={() => handleExport("Payables")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {isLoadingSuppliers ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading supplier data...</p>
              </div>
            ) : suppliers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Supplier</th>
                      <th className="text-left py-3 px-4 font-medium">Contact Person</th>
                      <th className="text-left py-3 px-4 font-medium">Email</th>
                      <th className="text-right py-3 px-4 font-medium">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {suppliers.map((supplier: any) => (
                      <tr key={supplier.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">{supplier.name}</td>
                        <td className="py-3 px-4">{supplier.contactPerson || supplier.contact_person || '-'}</td>
                        <td className="py-3 px-4">{supplier.email || '-'}</td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          supplier.balance < 0 ? 'text-rose-500' : 'text-emerald-500'
                        }`}>
                          ${Math.abs(supplier.balance).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No supplier payables found.</p>
            )}
          </GlassCard>
        </TabsContent>
        
        <TabsContent value="transactions" className="mt-0">
          <GlassCard>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Transaction History</h2>
              <Button size="sm" variant="outline" onClick={() => handleExport("Transaction History")}>
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
            
            {isLoadingTransactions ? (
              <div className="py-8 flex flex-col items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Loading transaction data...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left py-3 px-4 font-medium">Date</th>
                      <th className="text-left py-3 px-4 font-medium">Type</th>
                      <th className="text-left py-3 px-4 font-medium">Reference</th>
                      <th className="text-left py-3 px-4 font-medium">Contact</th>
                      <th className="text-left py-3 px-4 font-medium">Payment Method</th>
                      <th className="text-right py-3 px-4 font-medium">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {transactions.map((transaction: any) => (
                      <tr key={transaction.id} className="hover:bg-muted/30">
                        <td className="py-3 px-4">
                          {format(new Date(transaction.date), 'MMM d, yyyy')}
                        </td>
                        <td className="py-3 px-4 capitalize">{transaction.type}</td>
                        <td className="py-3 px-4">{transaction.reference || '-'}</td>
                        <td className="py-3 px-4">{transaction.contactName || '-'}</td>
                        <td className="py-3 px-4 capitalize">{transaction.paymentMethod || transaction.payment_method || '-'}</td>
                        <td className={`py-3 px-4 text-right font-medium ${
                          transaction.type === 'sale' || transaction.type === 'receipt' 
                            ? 'text-emerald-500' 
                            : 'text-rose-500'
                        }`}>
                          {transaction.type === 'sale' || transaction.type === 'receipt' ? '+' : '-'}
                          ${transaction.amount.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-muted-foreground py-4 text-center">No transactions found.</p>
            )}
          </GlassCard>
        </TabsContent>
      </Tabs>
      
      <ReportViewer 
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        reportData={currentReport}
        isLoading={isGeneratingReport}
        onDownloadPDF={() => downloadPdf(currentReport)}
        onDownloadCSV={() => downloadCsv(currentReport)}
      />
    </Layout>
  );
};

export default Reports;
