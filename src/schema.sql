
-- Database schema for Personal Finance Manager (SQLite version)

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL, -- In production, this would be hashed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('customer', 'supplier', 'borrower')),
  email TEXT,
  phone TEXT,
  contact_person TEXT,
  balance REAL DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  type TEXT NOT NULL CHECK (type IN ('sale', 'purchase', 'payment', 'receipt', 'expense')),
  amount REAL NOT NULL,
  date DATE NOT NULL,
  contact_id INTEGER REFERENCES contacts(id),
  reference TEXT,
  payment_method TEXT,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add default user for personal use
INSERT OR IGNORE INTO users (name, email, password) 
SELECT 'Personal User', 'user@example.com', 'password'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'user@example.com');
