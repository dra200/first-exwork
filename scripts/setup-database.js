import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read environment variables from .env file if it exists
try {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        if (!process.env[key]) {
          process.env[key] = value;
        }
      }
    });
  }
} catch (error) {
  console.error('Error loading .env file:', error);
}

// Database connection string
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('DATABASE_URL environment variable is not set.');
  process.exit(1);
}

const pool = new Pool({
  connectionString: databaseUrl,
});

// SQL to create tables
const createTablesSql = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(10) NOT NULL CHECK (role IN ('buyer', 'seller')),
  stripe_customer_id VARCHAR(255),
  stripe_subscription_id VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  budget NUMERIC(10, 2) NOT NULL,
  deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'completed', 'cancelled')),
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Proposals table
CREATE TABLE IF NOT EXISTS proposals (
  id SERIAL PRIMARY KEY,
  service_details TEXT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  delivery_time INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'completed')),
  project_id INTEGER NOT NULL REFERENCES projects(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments table
CREATE TABLE IF NOT EXISTS payments (
  id SERIAL PRIMARY KEY,
  amount NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_payment_id VARCHAR(255),
  project_id INTEGER NOT NULL REFERENCES projects(id),
  proposal_id INTEGER NOT NULL REFERENCES proposals(id),
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  seller_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  content TEXT NOT NULL,
  read BOOLEAN NOT NULL DEFAULT FALSE,
  project_id INTEGER NOT NULL REFERENCES projects(id),
  sender_id INTEGER NOT NULL REFERENCES users(id),
  receiver_id INTEGER NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sessions table for Express session with connect-pg-simple
CREATE TABLE IF NOT EXISTS "session" (
  "sid" varchar NOT NULL COLLATE "default",
  "sess" json NOT NULL,
  "expire" timestamp(6) NOT NULL,
  CONSTRAINT "session_pkey" PRIMARY KEY ("sid")
);
`;

// Create indexes
const createIndexesSql = `
-- Indexes for users table
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Indexes for projects table
CREATE INDEX IF NOT EXISTS idx_projects_buyer_id ON projects(buyer_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Indexes for proposals table
CREATE INDEX IF NOT EXISTS idx_proposals_project_id ON proposals(project_id);
CREATE INDEX IF NOT EXISTS idx_proposals_seller_id ON proposals(seller_id);
CREATE INDEX IF NOT EXISTS idx_proposals_status ON proposals(status);

-- Indexes for payments table
CREATE INDEX IF NOT EXISTS idx_payments_project_id ON payments(project_id);
CREATE INDEX IF NOT EXISTS idx_payments_buyer_id ON payments(buyer_id);
CREATE INDEX IF NOT EXISTS idx_payments_seller_id ON payments(seller_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);

-- Indexes for messages table
CREATE INDEX IF NOT EXISTS idx_messages_project_id ON messages(project_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_receiver_id ON messages(receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_read ON messages(read);

-- Index for sessions table
CREATE INDEX IF NOT EXISTS "IDX_session_expire" ON "session" ("expire");
`;

async function setupDatabase() {
  const client = await pool.connect();
  
  try {
    // Begin transaction
    await client.query('BEGIN');
    
    console.log('Creating tables...');
    await client.query(createTablesSql);
    
    console.log('Creating indexes...');
    await client.query(createIndexesSql);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('Database setup completed successfully.');
  } catch (error) {
    // Rollback transaction on error
    await client.query('ROLLBACK');
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();