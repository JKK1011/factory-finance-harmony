
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
  receivables: number;
  receivablesChange: number;
  contactsCount: number;
  contactsChange: number;
  transactionsCount: number;
  transactionsChange: number;
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

  createContact: async (contact: any): Promise<Contact> => {
    try {
      // Fixed: Properly handle the returned ID from the query
      const result = await query<any>(
        'INSERT INTO contacts (name, type, email, phone, contact_person, balance) VALUES (?, ?, ?, ?, ?, ?) RETURNING id',
        [contact.name, contact.type, contact.email, contact.phone, contact.contactPerson, 0]
      );
      
      // Make sure we have rows and access the ID properly
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
      // Update contact balance based on transaction type
      await updateContactBalance(transaction);

      // Fixed: Properly handle the returned ID from the query
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
      
      // Make sure we have rows and access the ID properly
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
        
        // Reverse the balance effect
        await updateContactBalance({
          ...transaction,
          amount: transaction.amount,
          contactId: transaction.contact_id,
          type: reverseTransactionType(transaction.type)
        });
        
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
      // Get total cash balance (sum of all transactions)
      const { rows: cashRows } = await query<any>(
        `SELECT SUM(CASE 
           WHEN type IN ('sale', 'receipt') THEN amount 
           WHEN type IN ('purchase', 'payment', 'expense') THEN -amount 
           ELSE 0 
         END) as total 
         FROM transactions`
      );
      
      // Get total receivables (sum of customer balances)
      const { rows: receivablesRows } = await query<any>(
        `SELECT SUM(balance) as total FROM contacts WHERE type = 'customer' AND balance > 0`
      );
      
      // Get contact count
      const { rows: contactCountRows } = await query<any>(
        `SELECT COUNT(*) as count FROM contacts`
      );
      
      // Get transaction count
      const { rows: transactionCountRows } = await query<any>(
        `SELECT COUNT(*) as count FROM transactions`
      );
      
      // Fixed: Properly handle potentially undefined values
      const cashTotal = cashRows && cashRows[0] ? (cashRows[0].total || 0) : 0;
      const receivablesTotal = receivablesRows && receivablesRows[0] ? (receivablesRows[0].total || 0) : 0;
      const contactsCount = contactCountRows && contactCountRows[0] ? (contactCountRows[0].count || 0) : 0;
      const transactionsCount = transactionCountRows && transactionCountRows[0] ? (transactionCountRows[0].count || 0) : 0;
      
      return {
        cashBalance: cashTotal,
        cashChange: 0, // We'll calculate this in a real app
        receivables: receivablesTotal,
        receivablesChange: 0, // We'll calculate this in a real app
        contactsCount: contactsCount,
        contactsChange: 0, // We'll calculate this in a real app
        transactionsCount: transactionsCount,
        transactionsChange: 0 // We'll calculate this in a real app
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
  
  let balanceChange = 0;
  
  // Calculate balance change based on transaction type
  switch (transaction.type) {
    case 'sale':
      balanceChange = transaction.amount;
      break;
    case 'receipt':
      balanceChange = -transaction.amount;
      break;
    case 'purchase':
      balanceChange = -transaction.amount;
      break;
    case 'payment':
      balanceChange = transaction.amount;
      break;
    case 'expense':
      // Expenses typically don't affect contact balances
      return;
  }
  
  // Update contact balance
  await query(
    'UPDATE contacts SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [balanceChange, transaction.contactId]
  );
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
