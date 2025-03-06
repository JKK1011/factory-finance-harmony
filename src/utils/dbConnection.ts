
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

// Ensure the data directory exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir);
}

// Connect to SQLite database
const dbPath = path.join(dataDir, 'factory_finance.db');
const db = new Database(dbPath);

console.log('Connected to SQLite database at:', dbPath);

// Helper function to execute SQL queries
export const query = async (text: string, params: any[] = []) => {
  try {
    if (text.trim().toLowerCase().startsWith('select')) {
      // For SELECT queries
      const stmt = db.prepare(text);
      const result = stmt.all(...params);
      return { rows: result };
    } else {
      // For INSERT, UPDATE, DELETE queries
      const stmt = db.prepare(text);
      const result = stmt.run(...params);
      return { 
        rows: [result],
        rowCount: result.changes
      };
    }
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

// Initialize the database with schema if it's a new database
const initializeDatabase = () => {
  const schemaPath = path.join(process.cwd(), 'src', 'schema.sql');
  if (fs.existsSync(schemaPath)) {
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split the schema into individual statements
    const statements = schema
      .replace(/--.*$/gm, '') // Remove SQL comments
      .split(';')
      .filter(stmt => stmt.trim().length > 0);
    
    try {
      // Begin transaction
      db.exec('BEGIN TRANSACTION');
      
      // Execute each statement
      for (const statement of statements) {
        db.exec(statement);
      }
      
      // Commit transaction
      db.exec('COMMIT');
      
      console.log('Database schema initialized successfully');
    } catch (error) {
      // Rollback on error
      db.exec('ROLLBACK');
      console.error('Error initializing database schema:', error);
    }
  } else {
    console.warn('Schema file not found at:', schemaPath);
  }
};

// Check if the database is empty (needs initialization)
const tableCount = db.prepare("SELECT count(*) as count FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'").get();
if (tableCount.count === 0) {
  console.log('New database detected, initializing schema...');
  initializeDatabase();
}

export default db;
