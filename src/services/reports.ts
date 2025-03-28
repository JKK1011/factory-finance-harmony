
import { financeApi, transactionsApi, contactsApi } from '@/services/api';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { format } from 'date-fns';

// Report data interfaces
export interface ReportData {
  title: string;
  generatedOn: string;
  data: any;
  summary?: Record<string, any>;
}

// Report generator functions
export const reportsService = {
  // Generate Profit & Loss Statement
  generateProfitLossStatement: async (period: string = '30'): Promise<ReportData> => {
    const { data: transactions = [] } = await transactionsApi.getTransactions();
    
    // Filter transactions based on period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const filteredTransactions = transactions.filter((t: any) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Calculate revenue and expenses
    let totalRevenue = 0;
    let totalExpenses = 0;
    const revenueByCategory: Record<string, number> = {};
    const expensesByCategory: Record<string, number> = {};
    
    filteredTransactions.forEach((t: any) => {
      const category = t.category || 'Uncategorized';
      
      if (t.type === 'sale' || t.type === 'receipt') {
        totalRevenue += t.amount;
        revenueByCategory[category] = (revenueByCategory[category] || 0) + t.amount;
      } else if (t.type === 'purchase' || t.type === 'payment' || t.type === 'expense') {
        totalExpenses += t.amount;
        expensesByCategory[category] = (expensesByCategory[category] || 0) + t.amount;
      }
    });
    
    const netProfit = totalRevenue - totalExpenses;
    
    return {
      title: 'Profit & Loss Statement',
      generatedOn: format(new Date(), 'MMM d, yyyy'),
      data: {
        period: `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`,
        revenueItems: Object.entries(revenueByCategory).map(([category, amount]) => ({ 
          category, amount 
        })),
        expenseItems: Object.entries(expensesByCategory).map(([category, amount]) => ({ 
          category, amount 
        })),
      },
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit
      }
    };
  },
  
  // Generate Balance Sheet
  generateBalanceSheet: async (): Promise<ReportData> => {
    const { data: financial } = await financeApi.getFinancialOverview();
    const { data: customers = [] } = await contactsApi.getContactsByType('customer');
    const { data: suppliers = [] } = await contactsApi.getContactsByType('supplier');
    
    const totalReceivables = customers.reduce((sum: number, customer: any) => 
      sum + Math.max(0, customer.balance), 0);
    
    const totalPayables = suppliers.reduce((sum: number, supplier: any) => 
      sum + Math.abs(Math.min(0, supplier.balance)), 0);
    
    const totalAssets = financial.cashBalance + financial.bankBalance + totalReceivables;
    const totalLiabilities = totalPayables;
    const equity = totalAssets - totalLiabilities;
    
    return {
      title: 'Balance Sheet',
      generatedOn: format(new Date(), 'MMM d, yyyy'),
      data: {
        assets: [
          { name: 'Cash', amount: financial.cashBalance },
          { name: 'Bank Account', amount: financial.bankBalance },
          { name: 'Accounts Receivable', amount: totalReceivables }
        ],
        liabilities: [
          { name: 'Accounts Payable', amount: totalPayables }
        ]
      },
      summary: {
        totalAssets,
        totalLiabilities,
        equity
      }
    };
  },
  
  // Generate Cash Flow Statement
  generateCashFlowStatement: async (period: string = '30'): Promise<ReportData> => {
    const { data: transactions = [] } = await transactionsApi.getTransactions();
    
    // Filter transactions based on period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const filteredTransactions = transactions.filter((t: any) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Process cash flow data
    let operatingActivities = 0;
    let investingActivities = 0;
    let financingActivities = 0;
    
    filteredTransactions.forEach((t: any) => {
      if (t.type === 'sale' || t.type === 'receipt' || t.type === 'purchase' || t.type === 'payment' || t.type === 'expense') {
        // Operating activities
        if (t.type === 'receipt' || t.type === 'sale') {
          operatingActivities += t.amount;
        } else if (t.type === 'payment' || t.type === 'purchase' || t.type === 'expense') {
          operatingActivities -= t.amount;
        }
      }
      // We'd add more logic for investing and financing activities in a real app
    });
    
    const netCashFlow = operatingActivities + investingActivities + financingActivities;
    
    return {
      title: 'Cash Flow Statement',
      generatedOn: format(new Date(), 'MMM d, yyyy'),
      data: {
        period: `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`,
        sections: [
          { 
            title: 'Operating Activities',
            items: [
              { name: 'Cash from Operations', amount: operatingActivities }
            ],
            total: operatingActivities 
          },
          { 
            title: 'Investing Activities',
            items: [
              { name: 'Capital Expenditures', amount: investingActivities }
            ],
            total: investingActivities 
          },
          { 
            title: 'Financing Activities',
            items: [
              { name: 'Loan Proceeds', amount: financingActivities }
            ],
            total: financingActivities 
          }
        ]
      },
      summary: {
        netCashFlow,
        beginningCashBalance: 0, // We'd calculate this in a real app
        endingCashBalance: netCashFlow // Simplified for demo
      }
    };
  },
  
  // Generate Customer Ledger
  generateCustomerLedger: async (): Promise<ReportData> => {
    const { data: customers = [] } = await contactsApi.getContactsByType('customer');
    const { data: transactions = [] } = await transactionsApi.getTransactions();
    
    // Build ledger data
    const customerTransactions = customers.map((customer: any) => {
      const customerTxns = transactions.filter((t: any) => 
        t.contactId === customer.id || t.contact_id === customer.id
      );
      
      return {
        id: customer.id,
        name: customer.name,
        balance: customer.balance,
        transactions: customerTxns.map((t: any) => ({
          id: t.id,
          date: format(new Date(t.date), 'MMM d, yyyy'),
          type: t.type,
          amount: t.amount,
          reference: t.reference || '-'
        }))
      };
    });
    
    const totalReceivables = customers.reduce((sum: number, customer: any) => 
      sum + Math.max(0, customer.balance), 0);
    
    return {
      title: 'Customer Ledger',
      generatedOn: format(new Date(), 'MMM d, yyyy'),
      data: {
        customers: customerTransactions
      },
      summary: {
        totalCustomers: customers.length,
        totalReceivables
      }
    };
  },
  
  // Generate Supplier Ledger
  generateSupplierLedger: async (): Promise<ReportData> => {
    const { data: suppliers = [] } = await contactsApi.getContactsByType('supplier');
    const { data: transactions = [] } = await transactionsApi.getTransactions();
    
    // Build ledger data
    const supplierTransactions = suppliers.map((supplier: any) => {
      const supplierTxns = transactions.filter((t: any) => 
        t.contactId === supplier.id || t.contact_id === supplier.id
      );
      
      return {
        id: supplier.id,
        name: supplier.name,
        balance: supplier.balance,
        transactions: supplierTxns.map((t: any) => ({
          id: t.id,
          date: format(new Date(t.date), 'MMM d, yyyy'),
          type: t.type,
          amount: t.amount,
          reference: t.reference || '-'
        }))
      };
    });
    
    const totalPayables = suppliers.reduce((sum: number, supplier: any) => 
      sum + Math.abs(Math.min(0, supplier.balance)), 0);
    
    return {
      title: 'Supplier Ledger',
      generatedOn: format(new Date(), 'MMM d, yyyy'),
      data: {
        suppliers: supplierTransactions
      },
      summary: {
        totalSuppliers: suppliers.length,
        totalPayables
      }
    };
  },
  
  // Generate Tax Summary
  generateTaxSummary: async (period: string = '365'): Promise<ReportData> => {
    const { data: transactions = [] } = await transactionsApi.getTransactions();
    
    // Filter transactions based on period
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(period));
    
    const filteredTransactions = transactions.filter((t: any) => {
      const transactionDate = new Date(t.date);
      return transactionDate >= startDate && transactionDate <= endDate;
    });
    
    // Calculate tax data (simple example - would be more complex in real app)
    const totalRevenue = filteredTransactions
      .filter((t: any) => t.type === 'sale' || t.type === 'receipt')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    const totalExpenses = filteredTransactions
      .filter((t: any) => t.type === 'purchase' || t.type === 'payment' || t.type === 'expense')
      .reduce((sum: number, t: any) => sum + t.amount, 0);
    
    // Simplified tax calculation - just for demonstration
    const estimatedTax = totalRevenue * 0.2 - totalExpenses * 0.2;
    
    return {
      title: 'Tax Summary',
      generatedOn: format(new Date(), 'MMM d, yyyy'),
      data: {
        period: `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`,
        revenue: {
          totalRevenue,
          taxableRevenue: totalRevenue
        },
        expenses: {
          totalExpenses,
          deductibleExpenses: totalExpenses
        }
      },
      summary: {
        taxableIncome: totalRevenue - totalExpenses,
        estimatedTax: Math.max(0, estimatedTax)
      }
    };
  },
  
  // Export functions
  exportToPDF: async (reportData: ReportData): Promise<Blob> => {
    const doc = new jsPDF();
    
    // Add title
    doc.setFontSize(18);
    doc.text(reportData.title, 14, 20);
    
    // Add generation date
    doc.setFontSize(12);
    doc.text(`Generated: ${reportData.generatedOn}`, 14, 30);
    
    // Add content based on report type
    if (reportData.title === 'Profit & Loss Statement') {
      // Add period
      doc.text(`Period: ${reportData.data.period}`, 14, 40);
      
      // Revenue section
      doc.setFontSize(14);
      doc.text('Revenue', 14, 55);
      
      const revenueRows = reportData.data.revenueItems.map((item: any) => [
        item.category, 
        `$${item.amount.toFixed(2)}`
      ]);
      
      // @ts-ignore - jspdf-autotable is imported but TypeScript doesn't recognize it
      doc.autoTable({
        startY: 60,
        head: [['Category', 'Amount']],
        body: revenueRows,
      });
      
      // Expenses section
      const expensesStartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Expenses', 14, expensesStartY);
      
      const expenseRows = reportData.data.expenseItems.map((item: any) => [
        item.category, 
        `$${item.amount.toFixed(2)}`
      ]);
      
      // @ts-ignore - jspdf-autotable is imported but TypeScript doesn't recognize it
      doc.autoTable({
        startY: expensesStartY + 5,
        head: [['Category', 'Amount']],
        body: expenseRows,
      });
      
      // Summary
      const summaryStartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Summary', 14, summaryStartY);
      
      // @ts-ignore - jspdf-autotable is imported but TypeScript doesn't recognize it
      doc.autoTable({
        startY: summaryStartY + 5,
        body: [
          ['Total Revenue', `$${reportData.summary?.totalRevenue.toFixed(2)}`],
          ['Total Expenses', `$${reportData.summary?.totalExpenses.toFixed(2)}`],
          ['Net Profit', `$${reportData.summary?.netProfit.toFixed(2)}`]
        ],
      });
    } 
    else if (reportData.title === 'Balance Sheet') {
      // Assets section
      doc.setFontSize(14);
      doc.text('Assets', 14, 50);
      
      const assetRows = reportData.data.assets.map((item: any) => [
        item.name, 
        `$${item.amount.toFixed(2)}`
      ]);
      
      // @ts-ignore - jspdf-autotable is imported but TypeScript doesn't recognize it
      doc.autoTable({
        startY: 55,
        head: [['Asset', 'Amount']],
        body: assetRows,
      });
      
      // Liabilities section
      const liabilitiesStartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Liabilities', 14, liabilitiesStartY);
      
      const liabilityRows = reportData.data.liabilities.map((item: any) => [
        item.name, 
        `$${item.amount.toFixed(2)}`
      ]);
      
      // @ts-ignore - jspdf-autotable is imported but TypeScript doesn't recognize it
      doc.autoTable({
        startY: liabilitiesStartY + 5,
        head: [['Liability', 'Amount']],
        body: liabilityRows,
      });
      
      // Summary
      const summaryStartY = (doc as any).lastAutoTable.finalY + 10;
      doc.setFontSize(14);
      doc.text('Summary', 14, summaryStartY);
      
      // @ts-ignore - jspdf-autotable is imported but TypeScript doesn't recognize it
      doc.autoTable({
        startY: summaryStartY + 5,
        body: [
          ['Total Assets', `$${reportData.summary?.totalAssets.toFixed(2)}`],
          ['Total Liabilities', `$${reportData.summary?.totalLiabilities.toFixed(2)}`],
          ['Equity', `$${reportData.summary?.equity.toFixed(2)}`]
        ],
      });
    }
    // Implement other report types similarly...
    
    return doc.output('blob');
  },
  
  exportToCSV: (reportData: ReportData): string => {
    let csv = '';
    
    // Add title
    csv += `"${reportData.title}"\n`;
    csv += `"Generated: ${reportData.generatedOn}"\n\n`;
    
    // Add content based on report type
    if (reportData.title === 'Profit & Loss Statement') {
      // Add period
      csv += `"Period: ${reportData.data.period}"\n\n`;
      
      // Revenue section
      csv += '"Revenue"\n';
      csv += '"Category","Amount"\n';
      
      reportData.data.revenueItems.forEach((item: any) => {
        csv += `"${item.category}","${item.amount.toFixed(2)}"\n`;
      });
      
      csv += '\n';
      
      // Expenses section
      csv += '"Expenses"\n';
      csv += '"Category","Amount"\n';
      
      reportData.data.expenseItems.forEach((item: any) => {
        csv += `"${item.category}","${item.amount.toFixed(2)}"\n`;
      });
      
      csv += '\n';
      
      // Summary
      csv += '"Summary"\n';
      csv += `"Total Revenue","${reportData.summary?.totalRevenue.toFixed(2)}"\n`;
      csv += `"Total Expenses","${reportData.summary?.totalExpenses.toFixed(2)}"\n`;
      csv += `"Net Profit","${reportData.summary?.netProfit.toFixed(2)}"\n`;
    } 
    else if (reportData.title === 'Balance Sheet') {
      // Assets section
      csv += '"Assets"\n';
      csv += '"Asset","Amount"\n';
      
      reportData.data.assets.forEach((item: any) => {
        csv += `"${item.name}","${item.amount.toFixed(2)}"\n`;
      });
      
      csv += '\n';
      
      // Liabilities section
      csv += '"Liabilities"\n';
      csv += '"Liability","Amount"\n';
      
      reportData.data.liabilities.forEach((item: any) => {
        csv += `"${item.name}","${item.amount.toFixed(2)}"\n`;
      });
      
      csv += '\n';
      
      // Summary
      csv += '"Summary"\n';
      csv += `"Total Assets","${reportData.summary?.totalAssets.toFixed(2)}"\n`;
      csv += `"Total Liabilities","${reportData.summary?.totalLiabilities.toFixed(2)}"\n`;
      csv += `"Equity","${reportData.summary?.equity.toFixed(2)}"\n`;
    }
    // Implement other report types similarly...
    
    return csv;
  }
};
