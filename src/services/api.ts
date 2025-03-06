
import { query } from '@/utils/dbConnection';

// Define interfaces for our data types
export interface Contact {
  id: string | number;
  name: string;
  type: 'customer' | 'supplier' | 'borrower';
  email: string;
  phone: string;
  contact_person: string;
  contactPerson?: string; // For frontend use
  balance: number;
  created_at?: string;
  updated_at?: string;
}

export interface Transaction {
  id: string | number;
  type: 'sale' | 'purchase' | 'payment' | 'receipt' | 'expense';
  amount: number;
  date: string;
  contact_id: string | number;
  contactId?: string | number; // For frontend use
  reference: string;
  payment_method: string;
  paymentMethod?: string; // For frontend use
  description: string;
  created_at?: string;
  updated_at?: string;
}

export interface User {
  id: string | number;
  name: string;
  email: string;
  password: string;
  created_at?: string;
  updated_at?: string;
}

// Contact related API calls
export const contactsApi = {
  // Get all contacts
  getContacts: async (): Promise<Contact[]> => {
    const result = await query<Contact>('SELECT * FROM contacts ORDER BY name');
    return result.rows.map(contact => ({
      ...contact,
      contactPerson: contact.contact_person // Map snake_case to camelCase for frontend
    }));
  },
  
  // Get contact by ID
  getContactById: async (id: string): Promise<Contact> => {
    const result = await query<Contact>('SELECT * FROM contacts WHERE id = ?', [id]);
    const contact = result.rows[0];
    return {
      ...contact,
      contactPerson: contact.contact_person
    };
  },
  
  // Create new contact
  createContact: async (contact: Partial<Contact>): Promise<Contact> => {
    const { name, type, email, phone, contactPerson, balance = 0 } = contact;
    const result = await query<Contact>(
      'INSERT INTO contacts (name, type, email, phone, contact_person, balance) VALUES (?, ?, ?, ?, ?, ?) RETURNING *',
      [name, type, email, phone, contactPerson, balance]
    );
    const newContact = result.rows[0];
    return {
      ...newContact,
      contactPerson: newContact.contact_person
    };
  },
  
  // Update contact
  updateContact: async (id: string, contact: Partial<Contact>): Promise<Contact> => {
    const { name, type, email, phone, contactPerson, balance } = contact;
    const result = await query<Contact>(
      'UPDATE contacts SET name = ?, type = ?, email = ?, phone = ?, contact_person = ?, balance = ? WHERE id = ? RETURNING *',
      [name, type, email, phone, contactPerson, balance, id]
    );
    const updatedContact = result.rows[0];
    return {
      ...updatedContact,
      contactPerson: updatedContact.contact_person
    };
  },
  
  // Delete contact
  deleteContact: async (id: string): Promise<{ success: boolean }> => {
    await query('DELETE FROM contacts WHERE id = ?', [id]);
    return { success: true };
  }
};

// Transaction related API calls
export const transactionsApi = {
  // Get all transactions
  getTransactions: async (): Promise<Transaction[]> => {
    const result = await query<Transaction>('SELECT * FROM transactions ORDER BY date DESC');
    return result.rows.map(transaction => ({
      ...transaction,
      contactId: transaction.contact_id,
      paymentMethod: transaction.payment_method
    }));
  },
  
  // Get transaction by ID
  getTransactionById: async (id: string): Promise<Transaction> => {
    const result = await query<Transaction>('SELECT * FROM transactions WHERE id = ?', [id]);
    const transaction = result.rows[0];
    return {
      ...transaction,
      contactId: transaction.contact_id,
      paymentMethod: transaction.payment_method
    };
  },
  
  // Create new transaction
  createTransaction: async (transaction: Partial<Transaction>): Promise<Transaction> => {
    const { type, amount, date, contactId, reference, paymentMethod, description } = transaction;
    const result = await query<Transaction>(
      'INSERT INTO transactions (type, amount, date, contact_id, reference, payment_method, description) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING *',
      [type, amount, date, contactId, reference, paymentMethod, description]
    );
    const newTransaction = result.rows[0];
    return {
      ...newTransaction,
      contactId: newTransaction.contact_id,
      paymentMethod: newTransaction.payment_method
    };
  },
  
  // Update transaction
  updateTransaction: async (id: string, transaction: Partial<Transaction>): Promise<Transaction> => {
    const { type, amount, date, contactId, reference, paymentMethod, description } = transaction;
    const result = await query<Transaction>(
      'UPDATE transactions SET type = ?, amount = ?, date = ?, contact_id = ?, reference = ?, payment_method = ?, description = ? WHERE id = ? RETURNING *',
      [type, amount, date, contactId, reference, paymentMethod, description, id]
    );
    const updatedTransaction = result.rows[0];
    return {
      ...updatedTransaction,
      contactId: updatedTransaction.contact_id,
      paymentMethod: updatedTransaction.payment_method
    };
  },
  
  // Delete transaction
  deleteTransaction: async (id: string): Promise<{ success: boolean }> => {
    await query('DELETE FROM transactions WHERE id = ?', [id]);
    return { success: true };
  }
};

// User related API calls
export const usersApi = {
  // Login user
  loginUser: async (email: string, password: string): Promise<{ id: string | number; email: string; name: string }> => {
    // In a real app, you would hash the password and use a secure authentication method
    // This is just a simple example for demonstration
    const result = await query<User>('SELECT * FROM users WHERE email = ?', [email]);
    if (result.rows.length === 0) {
      throw new Error('Invalid credentials');
    }
    const user = result.rows[0];
    // Simple password check - in reality, you'd use bcrypt or similar
    if (user.password !== password) {
      throw new Error('Invalid credentials');
    }
    return { id: user.id, email: user.email, name: user.name };
  }
};

interface FinancialSummary {
  total: number;
}

// Dashboard statistics
export const statsApi = {
  // Get financial summary
  getFinancialSummary: async () => {
    const salesResult = await query<FinancialSummary>('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ?', ['sale']);
    const expensesResult = await query<FinancialSummary>('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = ?', ['expense']);
    const receivablesResult = await query<FinancialSummary>('SELECT COALESCE(SUM(balance), 0) as total FROM contacts WHERE type = ? AND balance > 0', ['customer']);
    const payablesResult = await query<FinancialSummary>('SELECT COALESCE(SUM(balance), 0) as total FROM contacts WHERE type = ? AND balance < 0', ['supplier']);
    
    return {
      totalSales: salesResult.rows[0].total || 0,
      totalExpenses: expensesResult.rows[0].total || 0,
      totalReceivables: receivablesResult.rows[0].total || 0,
      totalPayables: Math.abs(payablesResult.rows[0].total || 0),
      netProfit: (salesResult.rows[0].total || 0) - (expensesResult.rows[0].total || 0)
    };
  },
  
  // Get monthly performance data
  getMonthlyPerformance: async (year: number) => {
    interface MonthlyData {
      month: number;
      sales: number;
      expenses: number;
    }
    
    // SQLite doesn't have EXTRACT() function, so we'll use strftime
    const result = await query<MonthlyData>(`
      SELECT 
        CAST(strftime('%m', date) AS INTEGER) as month,
        SUM(CASE WHEN type = 'sale' THEN amount ELSE 0 END) as sales,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE strftime('%Y', date) = ?
      GROUP BY month
      ORDER BY month
    `, [year.toString()]);
    
    return result.rows;
  }
};
