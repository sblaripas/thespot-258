-- Add password column to users table and seed staff users with passwords
-- This replaces OTP authentication with password-based authentication

-- Add password column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS password TEXT;

-- Remove OTP column (optional - keeping it for now in case of rollback)
-- ALTER TABLE users DROP COLUMN IF EXISTS otp;

-- Clear existing users (if any)
TRUNCATE TABLE users CASCADE;

-- Insert staff users with passwords
-- Tellers (password: teller123)
INSERT INTO users (id, phone, name, role, password, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '8212345678', 'Ana', 'teller', 'teller123', NOW(), NOW()),
  (gen_random_uuid(), '8412345678', 'Joana', 'teller', 'teller123', NOW(), NOW()),
  (gen_random_uuid(), '8712345678', 'Maria', 'teller', 'teller123', NOW(), NOW());

-- Bar/Waiters (password: staff123)
INSERT INTO users (id, phone, name, role, password, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '8222345678', 'Hyuta', 'barman', 'staff123', NOW(), NOW()),
  (gen_random_uuid(), '8422345678', 'Keny', 'waiter', 'staff123', NOW(), NOW()),
  (gen_random_uuid(), '8722345678', 'Tiago', 'waiter', 'staff123', NOW(), NOW());

-- Admins (password: admin123)
INSERT INTO users (id, phone, name, role, password, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '8232345678', 'Yanick', 'admin', 'admin123', NOW(), NOW()),
  (gen_random_uuid(), '8432345678', 'Dany', 'admin', 'admin123', NOW(), NOW()),
  (gen_random_uuid(), '8732345678', 'Laripas', 'admin', 'admin123', NOW(), NOW());

-- Update RLS policies for users table to allow staff to read their own data
DROP POLICY IF EXISTS "Users can read own data" ON users;
CREATE POLICY "Users can read own data" ON users
  FOR SELECT
  USING (true); -- Allow all authenticated users to read user data for login

-- Note: In production, you should hash passwords using a proper hashing algorithm
-- This is a simplified version for development purposes
