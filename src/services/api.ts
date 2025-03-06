
import { query } from '@/utils/dbConnection';

// Contact related API calls
export const contactsApi = {
  // Get all contacts
  getContacts: async () => {
    const result = await query('SELECT * FROM contacts ORDER BY name');
    return result.rows;
  },
  
  // Get contact by ID
  getContactById: async (id: string) => {
    const result = await query('SELECT * FROM contacts WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  // Create new contact
  createContact: async (contact: any) => {
    const { name, type, email, phone, contactPerson, balance = 0 } = contact;
    const result = await query(
      'INSERT INTO contacts (name, type, email, phone, contact_person, balance) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [name, type, email, phone, contactPerson, balance]
    );
    return result.rows[0];
  },
  
  // Update contact
  updateContact: async (id: string, contact: any) => {
    const { name, type, email, phone, contactPerson, balance } = contact;
    const result = await query(
      'UPDATE contacts SET name = $1, type = $2, email = $3, phone = $4, contact_person = $5, balance = $6 WHERE id = $7 RETURNING *',
      [name, type, email, phone, contactPerson, balance, id]
    );
    return result.rows[0];
  },
  
  // Delete contact
  deleteContact: async (id: string) => {
    await query('DELETE FROM contacts WHERE id = $1', [id]);
    return { success: true };
  }
};

// Transaction related API calls
export const transactionsApi = {
  // Get all transactions
  getTransactions: async () => {
    const result = await query('SELECT * FROM transactions ORDER BY date DESC');
    return result.rows;
  },
  
  // Get transaction by ID
  getTransactionById: async (id: string) => {
    const result = await query('SELECT * FROM transactions WHERE id = $1', [id]);
    return result.rows[0];
  },
  
  // Create new transaction
  createTransaction: async (transaction: any) => {
    const { type, amount, date, contactId, reference, paymentMethod, description } = transaction;
    const result = await query(
      'INSERT INTO transactions (type, amount, date, contact_id, reference, payment_method, description) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [type, amount, date, contactId, reference, paymentMethod, description]
    );
    return result.rows[0];
  },
  
  // Update transaction
  updateTransaction: async (id: string, transaction: any) => {
    const { type, amount, date, contactId, reference, paymentMethod, description } = transaction;
    const result = await query(
      'UPDATE transactions SET type = $1, amount = $2, date = $3, contact_id = $4, reference = $5, payment_method = $6, description = $7 WHERE id = $8 RETURNING *',
      [type, amount, date, contactId, reference, paymentMethod, description, id]
    );
    return result.rows[0];
  },
  
  // Delete transaction
  deleteTransaction: async (id: string) => {
    await query('DELETE FROM transactions WHERE id = $1', [id]);
    return { success: true };
  }
};

// User related API calls
export const usersApi = {
  // Login user
  loginUser: async (email: string, password: string) => {
    // In a real app, you would hash the password and use a secure authentication method
    // This is just a simple example for demonstration
    const result = await query('SELECT * FROM users WHERE email = $1', [email]);
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

// Dashboard statistics
export const statsApi = {
  // Get financial summary
  getFinancialSummary: async () => {
    const salesResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = $1', ['sale']);
    const expensesResult = await query('SELECT COALESCE(SUM(amount), 0) as total FROM transactions WHERE type = $1', ['expense']);
    const receivablesResult = await query('SELECT COALESCE(SUM(balance), 0) as total FROM contacts WHERE type = $1 AND balance > 0', ['customer']);
    const payablesResult = await query('SELECT COALESCE(SUM(balance), 0) as total FROM contacts WHERE type = $1 AND balance < 0', ['supplier']);
    
    return {
      totalSales: salesResult.rows[0].total,
      totalExpenses: expensesResult.rows[0].total,
      totalReceivables: receivablesResult.rows[0].total,
      totalPayables: Math.abs(payablesResult.rows[0].total),
      netProfit: salesResult.rows[0].total - expensesResult.rows[0].total
    };
  },
  
  // Get monthly performance data
  getMonthlyPerformance: async (year: number) => {
    const result = await query(`
      SELECT 
        EXTRACT(MONTH FROM date) as month,
        SUM(CASE WHEN type = 'sale' THEN amount ELSE 0 END) as sales,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expenses
      FROM transactions
      WHERE EXTRACT(YEAR FROM date) = $1
      GROUP BY month
      ORDER BY month
    `, [year]);
    
    return result.rows;
  }
};
