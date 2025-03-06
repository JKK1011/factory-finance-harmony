
-- Database schema for Factory Finance Manager (SQLite version)

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

-- Example seed data (only insert if tables are empty)
INSERT OR IGNORE INTO users (name, email, password) 
SELECT 'Admin User', 'admin@factoryfinance.com', 'password'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@factoryfinance.com');

-- Sample contacts
INSERT OR IGNORE INTO contacts (name, type, email, phone, contact_person, balance)
SELECT 'Acme Corporation', 'customer', 'info@acme.com', '(555) 123-4567', 'John Smith', 1250.50
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE name = 'Acme Corporation');

INSERT OR IGNORE INTO contacts (name, type, email, phone, contact_person, balance)
SELECT 'Global Supplies Inc', 'supplier', 'orders@globalsupplies.com', '(555) 987-6543', 'Maria Garcia', -450.75
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE name = 'Global Supplies Inc');

INSERT OR IGNORE INTO contacts (name, type, email, phone, contact_person, balance)
SELECT 'Tech Solutions Ltd', 'customer', 'hello@techsolutions.com', '(555) 234-5678', 'David Chen', 2450.50
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE name = 'Tech Solutions Ltd');

INSERT OR IGNORE INTO contacts (name, type, email, phone, contact_person, balance)
SELECT 'National Bank', 'borrower', 'support@nationalbank.com', '(555) 876-5432', 'Sarah Johnson', -5000.00
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE name = 'National Bank');

INSERT OR IGNORE INTO contacts (name, type, email, phone, contact_person, balance)
SELECT 'Smiths Manufacturing', 'customer', 'orders@smithsmfg.com', '(555) 345-6789', 'Robert Williams', 780.25
WHERE NOT EXISTS (SELECT 1 FROM contacts WHERE name = 'Smiths Manufacturing');

-- Sample transactions (only insert if table is empty)
INSERT OR IGNORE INTO transactions (type, amount, date, contact_id, reference, payment_method, description)
SELECT 'sale', 1250.00, '2023-05-15', 1, 'INV-2023-001', 'bank-transfer', 'Monthly product delivery'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference = 'INV-2023-001');

INSERT OR IGNORE INTO transactions (type, amount, date, contact_id, reference, payment_method, description)
SELECT 'purchase', 450.75, '2023-05-14', 2, 'PO-2023-042', 'check', 'Raw materials'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference = 'PO-2023-042');

INSERT OR IGNORE INTO transactions (type, amount, date, contact_id, reference, payment_method, description)
SELECT 'payment', 320.00, '2023-05-12', 4, 'PMT-2023-012', 'bank-transfer', 'Loan payment'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference = 'PMT-2023-012');

INSERT OR IGNORE INTO transactions (type, amount, date, contact_id, reference, payment_method, description)
SELECT 'receipt', 2450.50, '2023-05-10', 3, 'INV-2023-042', 'credit-card', 'Invoice #INV-2023-042'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference = 'INV-2023-042');

INSERT OR IGNORE INTO transactions (type, amount, date, contact_id, reference, payment_method, description)
SELECT 'sale', 780.25, '2023-05-08', 5, 'CM-458', 'cash', 'Custom order #CM-458'
WHERE NOT EXISTS (SELECT 1 FROM transactions WHERE reference = 'CM-458');
