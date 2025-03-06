
-- Database schema for Factory Finance Manager

-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL, -- In production, this would be hashed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE contacts (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('customer', 'supplier', 'borrower')),
  email VARCHAR(255),
  phone VARCHAR(50),
  contact_person VARCHAR(255),
  balance DECIMAL(12, 2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  type VARCHAR(50) NOT NULL CHECK (type IN ('sale', 'purchase', 'payment', 'receipt', 'expense')),
  amount DECIMAL(12, 2) NOT NULL,
  date DATE NOT NULL,
  contact_id INTEGER REFERENCES contacts(id),
  reference VARCHAR(100),
  payment_method VARCHAR(50),
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Example seed data
INSERT INTO users (name, email, password) VALUES
('Admin User', 'admin@factoryfinance.com', 'password');

INSERT INTO contacts (name, type, email, phone, contact_person, balance) VALUES
('Acme Corporation', 'customer', 'info@acme.com', '(555) 123-4567', 'John Smith', 1250.50),
('Global Supplies Inc', 'supplier', 'orders@globalsupplies.com', '(555) 987-6543', 'Maria Garcia', -450.75),
('Tech Solutions Ltd', 'customer', 'hello@techsolutions.com', '(555) 234-5678', 'David Chen', 2450.50),
('National Bank', 'borrower', 'support@nationalbank.com', '(555) 876-5432', 'Sarah Johnson', -5000.00),
('Smiths Manufacturing', 'customer', 'orders@smithsmfg.com', '(555) 345-6789', 'Robert Williams', 780.25);

-- Sample transactions
INSERT INTO transactions (type, amount, date, contact_id, reference, payment_method, description) VALUES
('sale', 1250.00, '2023-05-15', 1, 'INV-2023-001', 'bank-transfer', 'Monthly product delivery'),
('purchase', 450.75, '2023-05-14', 2, 'PO-2023-042', 'check', 'Raw materials'),
('payment', 320.00, '2023-05-12', 4, 'PMT-2023-012', 'bank-transfer', 'Loan payment'),
('receipt', 2450.50, '2023-05-10', 3, 'INV-2023-042', 'credit-card', 'Invoice #INV-2023-042'),
('sale', 780.25, '2023-05-08', 5, 'CM-458', 'cash', 'Custom order #CM-458');
