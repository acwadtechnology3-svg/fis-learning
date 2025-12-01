import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema';
import 'dotenv/config';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Database connection event listeners
pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

pool.on('error', (err) => {
  console.error('❌ Database connection error:', err);
});

// Test database connection on startup
pool.query('SELECT NOW()')
  .then(() => {
    console.log('✅ Database connection test successful');
  })
  .catch((err) => {
    console.error('❌ Database connection test failed:', err.message);
  });

export const db = drizzle(pool, { schema });
