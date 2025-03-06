
// Create an in-memory database implementation that mimics SQLite functionality
// This is a browser-compatible alternative to better-sqlite3

// Type definitions for our mock database
type RowData = Record<string, any>;
type Statement = {
  all: (...params: any[]) => RowData[];
  get: (...params: any[]) => RowData | undefined;
  run: (...params: any[]) => { changes: number };
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
    this.initSampleData();
  }

  // Initialize with sample data
  private initSampleData() {
    // Sample users
    tables.users.push({
      id: ++lastIds.users,
      name: 'Admin User',
      email: 'admin@factoryfinance.com',
      password: 'password',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Sample contacts
    const contactsData = [
      {
        name: 'Acme Corporation',
        type: 'customer',
        email: 'info@acme.com',
        phone: '(555) 123-4567',
        contact_person: 'John Smith',
        balance: 1250.50
      },
      {
        name: 'Global Supplies Inc',
        type: 'supplier',
        email: 'orders@globalsupplies.com',
        phone: '(555) 987-6543',
        contact_person: 'Maria Garcia',
        balance: -450.75
      },
      {
        name: 'Tech Solutions Ltd',
        type: 'customer',
        email: 'hello@techsolutions.com',
        phone: '(555) 234-5678',
        contact_person: 'David Chen',
        balance: 2450.50
      },
      {
        name: 'National Bank',
        type: 'borrower',
        email: 'support@nationalbank.com',
        phone: '(555) 876-5432',
        contact_person: 'Sarah Johnson',
        balance: -5000.00
      },
      {
        name: 'Smiths Manufacturing',
        type: 'customer',
        email: 'orders@smithsmfg.com',
        phone: '(555) 345-6789',
        contact_person: 'Robert Williams',
        balance: 780.25
      }
    ];

    contactsData.forEach(contact => {
      tables.contacts.push({
        ...contact,
        id: ++lastIds.contacts,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    // Sample transactions
    const transactionsData = [
      {
        type: 'sale',
        amount: 1250.00,
        date: '2023-05-15',
        contact_id: 1,
        reference: 'INV-2023-001',
        payment_method: 'bank-transfer',
        description: 'Monthly product delivery'
      },
      {
        type: 'purchase',
        amount: 450.75,
        date: '2023-05-14',
        contact_id: 2,
        reference: 'PO-2023-042',
        payment_method: 'check',
        description: 'Raw materials'
      },
      {
        type: 'payment',
        amount: 320.00,
        date: '2023-05-12',
        contact_id: 4,
        reference: 'PMT-2023-012',
        payment_method: 'bank-transfer',
        description: 'Loan payment'
      },
      {
        type: 'receipt',
        amount: 2450.50,
        date: '2023-05-10',
        contact_id: 3,
        reference: 'INV-2023-042',
        payment_method: 'credit-card',
        description: 'Invoice #INV-2023-042'
      },
      {
        type: 'sale',
        amount: 780.25,
        date: '2023-05-08',
        contact_id: 5,
        reference: 'CM-458',
        payment_method: 'cash',
        description: 'Custom order #CM-458'
      }
    ];

    transactionsData.forEach(transaction => {
      tables.transactions.push({
        ...transaction,
        id: ++lastIds.transactions,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    });

    console.log('Sample data initialized', tables);
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
      run: (...params: any[]): { changes: number } => {
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
  private executeModification(sql: string, params: any[]): { changes: number } {
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
      return { changes: 1 };
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
      return { 
        rows: [{ id: lastIds[text.match(/FROM|INTO|UPDATE\s+(\w+)/i)?.[1].toLowerCase() || ''] } as any as T],
        rowCount: result.changes
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default db;
