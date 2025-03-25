import { query } from '@/utils/dbConnection';

// Define our types
export interface User {
  id: string | number;
  name: string;
  email: string;
}

export interface Contact {
  id: string | number;
  name: string;
  type: string;
  email: string;
  phone: string;
  contactPerson: string;
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string | number;
  type: string;
  amount: number;
  date: string;
  contactId: string | number;
  reference: string;
  paymentMethod: string;
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface FinancialOverview {
  cashBalance: number;
  cashChange: number;
  bankBalance: number;
  bankChange: number;
  receivables: number;
  receivablesChange: number;
  payables: number;
  payablesChange: number;
}

// Auth API
export const authApi = {
  loginUser: async (email: string, password: string): Promise<User> => {
    try {
      const { rows } = await query<any>(
        'SELECT * FROM users WHERE email = ? AND password = ? LIMIT 1',
        [email, password]
      );

      if (rows.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = rows[0];
      return { 
        id: user.id, 
        email: user.email, 
        name: user.name 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }
};

// Contacts API
export const contactsApi = {
  getContacts: async (): Promise<Contact[]> => {
    try {
      const { rows } = await query<any>('SELECT * FROM contacts ORDER BY name ASC');
      return rows;
    } catch (error) {
      console.error('Error fetching contacts:', error);
      throw error;
    }
  },

  getContactsByType: async (type: string): Promise<Contact[]> => {
    try {
      const { rows } = await query<any>('SELECT * FROM contacts WHERE type = ? ORDER BY name ASC', [type]);
      return rows;
    } catch (error) {
      console.error('Error fetching contacts by type:', error);
      throw error;
    }
  },

  createContact: async (contact: any): Promise<Contact> => {
    try {
      const result = await query<any>(
        'INSERT INTO contacts (name, type, email, phone, contact_person, balance) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
        [contact.name, contact.type, contact.email, contact.phone, contact.contactPerson, 0]
      );
      
      const newId = result.rows && result.rows.length > 0 ? result.rows[0].id : Date.now();
      
      return { 
        id: newId,
        name: contact.name,
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        contactPerson: contact.contactPerson,
        balance: 0
      };
    } catch (error) {
      console.error('Error creating contact:', error);
      throw error;
    }
  },

  deleteContact: async (id: string): Promise<void> => {
    try {
      await query('DELETE FROM contacts WHERE id = ?', [id]);
    } catch (error) {
      console.error('Error deleting contact:', error);
      throw error;
    }
  }
};

// Transactions API
export const transactionsApi = {
  getTransactions: async (): Promise<any[]> => {
    try {
      const { rows } = await query<any>(
        `SELECT t.*, c.name as contactName 
         FROM transactions t
         LEFT JOIN contacts c ON t.contact_id = c.id
         ORDER BY t.date DESC, t.id DESC`
      );
      return rows;
    } catch (error) {
      console.error('Error fetching transactions:', error);
      throw error;
    }
  },

  getRecentTransactions: async (): Promise<any[]> => {
    try {
      const { rows } = await query<any>(
        `SELECT t.*, c.name as contactName 
         FROM transactions t
         LEFT JOIN contacts c ON t.contact_id = c.id
         ORDER BY t.date DESC, t.id DESC
         LIMIT 5`
      );
      return rows;
    } catch (error) {
      console.error('Error fetching recent transactions:', error);
      throw error;
    }
  },

  createTransaction: async (transaction: any): Promise<any> => {
    try {
      // For sales, simply increase the contact's balance (receivable)
      if (transaction.type === 'sale') {
        await updateContactBalance({
          ...transaction,
          // Sales increase receivables (positive balance for customers)
          amount: transaction.amount
        });
      } 
      // For purchases, simply decrease the contact's balance (payable)
      else if (transaction.type === 'purchase') {
        await updateContactBalance({
          ...transaction,
          // Purchases decrease balance (negative balance means we owe them)
          amount: -transaction.amount
        });
      } 
      // For payments, receipts, and expenses, update both contact and cash/bank balances
      else {
        // For payments, we pay money to suppliers (decreases our cash/bank, decreases what we owe)
        if (transaction.type === 'payment') {
          await updateContactBalance({
            ...transaction,
            // Payment to supplier reduces what we owe them (increases their balance)
            amount: transaction.amount
          });
          await updateAccountBalance({
            ...transaction,
            // Payment reduces our cash/bank balance
            amount: -transaction.amount
          });
        } 
        // For receipts, we receive money from customers (increases our cash/bank, decreases what they owe)
        else if (transaction.type === 'receipt') {
          await updateContactBalance({
            ...transaction,
            // Receipt from customer reduces what they owe us (decreases their balance)
            amount: -transaction.amount
          });
          await updateAccountBalance({
            ...transaction,
            // Receipt increases our cash/bank balance
            amount: transaction.amount
          });
        }
        // For expenses, only update cash/bank balance (no contact balance affected)
        else if (transaction.type === 'expense') {
          await updateAccountBalance({
            ...transaction,
            // Expense reduces our cash/bank balance
            amount: -transaction.amount
          });
        }
      }

      const result = await query<any>(
        `INSERT INTO transactions 
         (type, amount, date, contact_id, reference, payment_method, description) 
         VALUES (?, ?, ?, ?, ?, ?, ?) 
         RETURNING id`,
        [
          transaction.type, 
          transaction.amount, 
          transaction.date, 
          transaction.contactId, 
          transaction.reference, 
          transaction.paymentMethod, 
          transaction.description
        ]
      );
      
      const newId = result.rows && result.rows.length > 0 ? result.rows[0].id : Date.now();
      
      return { 
        id: newId, 
        ...transaction 
      };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  },

  deleteTransaction: async (id: string): Promise<void> => {
    try {
      // First get the transaction to update contact balance
      const { rows: transactionRows } = await query<any>(
        'SELECT * FROM transactions WHERE id = ?',
        [id]
      );
      
      if (transactionRows.length > 0) {
        const transaction = transactionRows[0];
        
        // Reverse the balance effect based on transaction type
        if (transaction.type === 'sale') {
          // Reverse the sale (decrease receivable)
          await updateContactBalance({
            ...transaction,
            contactId: transaction.contact_id,
            amount: -transaction.amount
          });
        } 
        else if (transaction.type === 'purchase') {
          // Reverse the purchase (increase payable)
          await updateContactBalance({
            ...transaction,
            contactId: transaction.contact_id,
            amount: transaction.amount
          });
        }
        else if (transaction.type === 'payment') {
          // Reverse payment (decrease what the supplier owes us, increase our cash/bank)
          await updateContactBalance({
            ...transaction,
            contactId: transaction.contact_id,
            amount: -transaction.amount
          });
          await updateAccountBalance({
            ...transaction,
            paymentMethod: transaction.payment_method,
            amount: transaction.amount
          });
        }
        else if (transaction.type === 'receipt') {
          // Reverse receipt (increase what the customer owes us, decrease our cash/bank)
          await updateContactBalance({
            ...transaction,
            contactId: transaction.contact_id,
            amount: transaction.amount
          });
          await updateAccountBalance({
            ...transaction,
            paymentMethod: transaction.payment_method,
            amount: -transaction.amount
          });
        }
        else if (transaction.type === 'expense') {
          // Reverse expense (increase our cash/bank)
          await updateAccountBalance({
            ...transaction,
            paymentMethod: transaction.payment_method,
            amount: transaction.amount
          });
        }
        
        // Delete the transaction
        await query('DELETE FROM transactions WHERE id = ?', [id]);
      }
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }
};

// Finance API for dashboard
export const financeApi = {
  getFinancialOverview: async (): Promise<FinancialOverview> => {
    try {
      // Get cash balance (sum of cash transactions)
      const { rows: cashRows } = await query<any>(
        `SELECT SUM(CASE 
           WHEN (type = 'receipt' OR type = 'payment' OR type = 'expense') AND payment_method = 'cash' THEN
             CASE
               WHEN type = 'receipt' THEN amount
               WHEN type IN ('payment', 'expense') THEN -amount
             END
           ELSE 0
         END) as total
         FROM transactions`
      );
      
      // Get bank balance (sum of bank transfer transactions)
      const { rows: bankRows } = await query<any>(
        `SELECT SUM(CASE 
           WHEN (type = 'receipt' OR type = 'payment' OR type = 'expense') AND payment_method = 'bank-transfer' THEN
             CASE
               WHEN type = 'receipt' THEN amount
               WHEN type IN ('payment', 'expense') THEN -amount
             END
           ELSE 0
         END) as total
         FROM transactions`
      );
      
      // Get total receivables (sum of customer balances)
      const { rows: receivablesRows } = await query<any>(
        `SELECT SUM(balance) as total FROM contacts WHERE type = 'customer' AND balance > 0`
      );
      
      // Get total payables (sum of supplier balances)
      const { rows: payablesRows } = await query<any>(
        `SELECT SUM(ABS(balance)) as total FROM contacts WHERE type = 'supplier' AND balance < 0`
      );
      
      // Fixed: Properly handle potentially undefined values
      const cashTotal = cashRows && cashRows[0] ? (cashRows[0].total || 0) : 0;
      const bankTotal = bankRows && bankRows[0] ? (bankRows[0].total || 0) : 0;
      const receivablesTotal = receivablesRows && receivablesRows[0] ? (receivablesRows[0].total || 0) : 0;
      const payablesTotal = payablesRows && payablesRows[0] ? (payablesRows[0].total || 0) : 0;
      
      return {
        cashBalance: cashTotal,
        cashChange: 0, // We'll calculate this in a real app
        bankBalance: bankTotal,
        bankChange: 0, // We'll calculate this in a real app
        receivables: receivablesTotal,
        receivablesChange: 0, // We'll calculate this in a real app
        payables: payablesTotal,
        payablesChange: 0 // We'll calculate this in a real app
      };
    } catch (error) {
      console.error('Error fetching financial overview:', error);
      throw error;
    }
  }
};

// Helper function to update contact balance based on transaction type
async function updateContactBalance(transaction: any): Promise<void> {
  if (!transaction.contactId) return;
  
  // Update contact balance directly with the provided amount
  // For sales: positive amount increases customer balance (they owe us more)
  // For purchases: negative amount decreases supplier balance (we owe them more)
  // For payments: positive amount increases supplier balance (we owe them less)
  // For receipts: negative amount decreases customer balance (they owe us less)
  await query(
    'UPDATE contacts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [transaction.amount, transaction.contactId]
  );
}

// Helper function to update cash or bank balance based on payment method
async function updateAccountBalance(transaction: any): Promise<void> {
  // Only process transactions that affect account balances (payments, receipts, expenses)
  if (transaction.type !== 'payment' && transaction.type !== 'receipt' && transaction.type !== 'expense') {
    return;
  }
  
  // Note: Cash and bank balances are calculated in the getFinancialOverview method
  // We don't need to update any specific table for this, as the balances are
  // calculated by summing relevant transactions with the correct payment method
}

// Helper function to get the reverse transaction type for deletion
function reverseTransactionType(type: string): string {
  switch (type) {
    case 'sale': return 'receipt';
    case 'receipt': return 'sale';
    case 'purchase': return 'payment';
    case 'payment': return 'purchase';
    case 'expense': return 'expense';
    default: return type;
  }
}

