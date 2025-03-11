// Create an in-memory database implementation that mimics SQLite functionality
// This is a browser-compatible alternative to better-sqlite3

// Type definitions for our mock database
type RowData = Record<string, any>;
type Statement = {
  all: (...params: any[]) => RowData[];
  get: (...params: any[]) => RowData | undefined;
  run: (...params: any[]) => { changes: number; lastID?: number };
};

// In-memory database tables
const tables: Record<string, RowData[]> = {
  users: [],
  contacts: [],
  transactions: []
};

// Last inserted IDs for auto-increment
const lastIds: Record<string, number> = {
  users: 0,
  contacts: 0,
  transactions: 0
};

// Mock Database class
class InMemoryDatabase {
  constructor() {
    console.log('Connected to in-memory database');
    this.initDefaultUser();
    this.initDummyData();
  }

  // Initialize with just a default user for login
  private initDefaultUser() {
    // Add a default user for login
    tables.users.push({
      id: ++lastIds.users,
      name: 'Personal User',
      email: 'user@example.com',
      password: 'password',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    console.log('Default user initialized');
  }

  // Add dummy data for testing
  private initDummyData() {
    // Add dummy contacts
    const contacts = [
      {
        name: 'Acme Corporation',
        type: 'customer',
        email: 'sales@acme.com',
        phone: '555-123-4567',
        contactPerson: 'John Smith',
        balance: 2500
      },
      {
        name: 'Tech Supplies Inc',
        type: 'supplier',
        email: 'orders@techsupplies.com',
        phone: '555-987-6543',
        contactPerson: 'Jane Doe',
        balance: -1200
      },
      {
        name: 'Friendly Rentals',
        type: 'customer',
        email: 'contact@friendlyrentals.com',
        phone: '555-333-4444',
        contactPerson: 'Robert Johnson',
        balance: 1700
      },
      {
        name: 'Global Distributors',
        type: 'supplier',
        email: 'info@globaldist.com',
        phone: '555-555-5555',
        contactPerson: 'Maria Rodriguez',
        balance: -800
      },
      {
        name: 'City Services',
        type: 'supplier',
        email: 'billing@cityservices.com',
        phone: '555-222-3333',
        contactPerson: 'David Williams',
        balance: -350
      },
      {
        name: 'Mark Davis',
        type: 'borrower',
        email: 'mark@example.com',
        phone: '555-444-9999',
        contactPerson: '',
        balance: 500
      }
    ];

    contacts.forEach(contact => {
      const id = ++lastIds.contacts;
      tables.contacts.push({
        id,
        name: contact.name,
        type: contact.type,
        email: contact.email,
        phone: contact.phone,
        contact_person: contact.contactPerson,
        balance: contact.balance,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    // Add dummy transactions
    const transactions = [
      {
        type: 'sale',
        amount: 2500,
        date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 1, // Acme Corporation
        reference: 'INV-2023-001',
        payment_method: 'credit_card',
        description: 'Website development services'
      },
      {
        type: 'purchase',
        amount: 1200,
        date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 2, // Tech Supplies Inc
        reference: 'PO-2023-001',
        payment_method: 'bank_transfer',
        description: 'Office equipment'
      },
      {
        type: 'receipt',
        amount: 800,
        date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 1, // Acme Corporation
        reference: 'REC-2023-001',
        payment_method: 'bank_transfer',
        description: 'Partial payment for INV-2023-001'
      },
      {
        type: 'sale',
        amount: 1700,
        date: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 3, // Friendly Rentals
        reference: 'INV-2023-002',
        payment_method: 'credit_card',
        description: 'Consulting services'
      },
      {
        type: 'purchase',
        amount: 800,
        date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 4, // Global Distributors
        reference: 'PO-2023-002',
        payment_method: 'bank_transfer',
        description: 'Inventory supplies'
      },
      {
        type: 'expense',
        amount: 350,
        date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 5, // City Services
        reference: 'EXP-2023-001',
        payment_method: 'credit_card',
        description: 'Utilities payment'
      },
      {
        type: 'payment',
        amount: 400,
        date: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 2, // Tech Supplies Inc
        reference: 'PAY-2023-001',
        payment_method: 'bank_transfer',
        description: 'Partial payment for PO-2023-001'
      },
      {
        type: 'sale',
        amount: 500,
        date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 6, // Mark Davis
        reference: 'LOAN-2023-001',
        payment_method: 'cash',
        description: 'Personal loan'
      }
    ];

    transactions.forEach(transaction => {
      const id = ++lastIds.transactions;
      tables.transactions.push({
        id,
        type: transaction.type,
        amount: transaction.amount,
        date: transaction.date,
        contact_id: transaction.contact_id,
        reference: transaction.reference,
        payment_method: transaction.payment_method,
        description: transaction.description,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    console.log(`Dummy data initialized: ${contacts.length} contacts, ${transactions.length} transactions`);
  }

  // Prepare a SQL statement
  prepare(sql: string): Statement {
    const tableName = this.extractTableName(sql);
    
    return {
      // For SELECT queries
      all: (...params: any[]): RowData[] => {
        return this.executeQuery(sql, params);
      },
      // For SELECT single row
      get: (...params: any[]): RowData | undefined => {
        const results = this.executeQuery(sql, params);
        return results.length > 0 ? results[0] : undefined;
      },
      // For INSERT, UPDATE, DELETE
      run: (...params: any[]): { changes: number; lastID?: number } => {
        return this.executeModification(sql, params);
      }
    };
  }

  // Execute SQL directly (for transactions)
  exec(sql: string): void {
    // Simple implementation to support transactions
    console.log('Executing SQL:', sql);
    // No actual transaction support needed for the mock
  }

  // Extract table name from SQL query
  private extractTableName(sql: string): string {
    const matches = sql.match(/FROM\s+(\w+)/i) || sql.match(/INTO\s+(\w+)/i) || sql.match(/UPDATE\s+(\w+)/i);
    return matches ? matches[1].toLowerCase() : '';
  }

  // Execute a SELECT query
  private executeQuery(sql: string, params: any[]): RowData[] {
    console.log('Executing query:', sql, params);
    
    const tableName = this.extractTableName(sql);
    if (!tableName || !tables[tableName]) return [];
    
    let results = [...tables[tableName]];
    
    // Handle WHERE clauses (basic implementation)
    if (sql.includes('WHERE')) {
      const whereClause = sql.split('WHERE')[1].split(/ORDER BY|GROUP BY|LIMIT/)[0].trim();
      
      // Parse the WHERE condition (very simplified)
      results = results.filter(row => {
        if (whereClause.includes('=')) {
          const parts = whereClause.split('=');
          const field = parts[0].trim();
          let value = parts[1].trim();
          
          // Handle parameterized queries
          if (value === '?') {
            value = params.shift();
          } else if (value.startsWith("'") && value.endsWith("'")) {
            value = value.slice(1, -1);
          }
          
          // Special case for SQL functions like COALESCE
          if (field.includes('COALESCE') && field.includes('SUM')) {
            const sumField = field.match(/SUM\((\w+)\)/i);
            if (sumField) {
              const fieldToSum = sumField[1];
              return row[fieldToSum] ? true : false;
            }
          }
          
          return row[field] == value;
        }
        return true;
      });
    }
    
    // Handle aggregate functions
    if (sql.toLowerCase().includes('sum(')) {
      const sumMatch = sql.match(/SUM\((\w+)\)/i);
      if (sumMatch) {
        const fieldToSum = sumMatch[1];
        const sum = results.reduce((acc, row) => acc + (Number(row[fieldToSum]) || 0), 0);
        return [{ total: sum }];
      }
    }
    
    // Handle COUNT
    if (sql.toLowerCase().includes('count(*)')) {
      return [{ count: results.length }];
    }
    
    // Handle ORDER BY (simplified)
    if (sql.toLowerCase().includes('order by')) {
      const orderMatch = sql.match(/ORDER BY\s+(\w+)(\s+(ASC|DESC))?/i);
      if (orderMatch) {
        const orderField = orderMatch[1];
        const orderDirection = (orderMatch[3] || 'ASC').toUpperCase();
        
        results.sort((a, b) => {
          if (orderDirection === 'ASC') {
            return a[orderField] > b[orderField] ? 1 : -1;
          } else {
            return a[orderField] < b[orderField] ? 1 : -1;
          }
        });
      }
    }
    
    return results;
  }
  
  // Execute an INSERT, UPDATE, or DELETE
  private executeModification(sql: string, params: any[]): { changes: number; lastID?: number } {
    console.log('Executing modification:', sql, params);
    
    const tableName = this.extractTableName(sql);
    if (!tableName || !tables[tableName]) return { changes: 0 };
    
    // Handle INSERT
    if (sql.toLowerCase().includes('insert into')) {
      const columnsMatch = sql.match(/\(([^)]+)\)/);
      if (!columnsMatch) return { changes: 0 };
      
      const columns = columnsMatch[1].split(',').map(col => col.trim());
      const newId = ++lastIds[tableName];
      
      const newRow: RowData = {
        id: newId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      // Populate values from params
      columns.forEach((col, index) => {
        newRow[col] = params[index];
      });
      
      tables[tableName].push(newRow);
      return { changes: 1, lastID: newId };
    }
    
    // Handle UPDATE
    if (sql.toLowerCase().includes('update')) {
      const setMatch = sql.match(/SET\s+([^WHERE]+)/i);
      if (!setMatch) return { changes: 0 };
      
      const setClauses = setMatch[1].split(',').map(clause => clause.trim());
      const whereMatch = sql.match(/WHERE\s+(.+)$/i);
      
      const updateFields: Record<string, any> = {};
      setClauses.forEach((clause, index) => {
        if (clause.includes('=')) {
          const [field] = clause.split('=');
          updateFields[field.trim()] = params[index];
        }
      });
      
      let updated = 0;
      
      // Apply updates
      if (whereMatch) {
        const whereCondition = whereMatch[1];
        const idMatch = whereCondition.match(/id\s*=\s*\?/);
        
        if (idMatch) {
          const idToUpdate = params[params.length - 1];
          
          tables[tableName] = tables[tableName].map(row => {
            if (row.id == idToUpdate) {
              updated++;
              return { 
                ...row, 
                ...updateFields,
                updated_at: new Date().toISOString()
              };
            }
            return row;
          });
        }
      }
      
      return { changes: updated };
    }
    
    // Handle DELETE
    if (sql.toLowerCase().includes('delete from')) {
      const whereMatch = sql.match(/WHERE\s+(.+)$/i);
      
      if (whereMatch) {
        const whereCondition = whereMatch[1];
        const idMatch = whereCondition.match(/id\s*=\s*\?/);
        
        if (idMatch) {
          const idToDelete = params[0];
          const initialLength = tables[tableName].length;
          
          tables[tableName] = tables[tableName].filter(row => row.id != idToDelete);
          
          return { changes: initialLength - tables[tableName].length };
        }
      }
    }
    
    return { changes: 0 };
  }
}

// Create a single instance of our database
const db = new InMemoryDatabase();

// Helper function to execute SQL queries
export const query = async <T = Record<string, any>>(text: string, params: any[] = []): Promise<{ rows: T[], rowCount?: number }> => {
  try {
    if (text.trim().toLowerCase().startsWith('select')) {
      // For SELECT queries
      const stmt = db.prepare(text);
      const result = stmt.all(...params) as T[];
      return { rows: result };
    } else {
      // For INSERT, UPDATE, DELETE queries
      const stmt = db.prepare(text);
      const result = stmt.run(...params);
      const tableName = text.match(/FROM|INTO|UPDATE\s+(\w+)/i)?.[1]?.toLowerCase() || '';
      
      // For INSERT queries with RETURNING clause, return the inserted ID
      if (text.toLowerCase().includes('insert') && text.toLowerCase().includes('returning id') && result.lastID) {
        return { 
          rows: [{ id: result.lastID } as unknown as T],
          rowCount: result.changes
        };
      }
      
      return { 
        rows: [],
        rowCount: result.changes
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default db;
