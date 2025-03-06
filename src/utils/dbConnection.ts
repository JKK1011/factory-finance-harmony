
import { Pool } from 'pg';

// Create a pool of connections to the PostgreSQL database
const pool = new Pool({
  user: import.meta.env.VITE_DB_USER,
  host: import.meta.env.VITE_DB_HOST,
  database: import.meta.env.VITE_DB_NAME,
  password: import.meta.env.VITE_DB_PASSWORD,
  port: parseInt(import.meta.env.VITE_DB_PORT || '5432'),
  ssl: import.meta.env.VITE_DB_SSL === 'true' ? { rejectUnauthorized: false } : false
});

// Test the connection
pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err);
});

// Helper function to execute SQL queries
export const query = async (text: string, params?: any[]) => {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
};

export default pool;
