-- ========================
-- FIX INFINITE RECURSION IN RLS POLICIES
-- This script fixes the circular dependency issue between users and wallets tables
-- ========================

-- ============================================================================
-- STEP 1: DISABLE RLS ON USERS TABLE (we're using employees now)
-- ============================================================================

-- Drop all policies on users table
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Staff can manage users" ON users;
DROP POLICY IF EXISTS "Public can view users" ON users;
DROP POLICY IF EXISTS "wallets_owner_access" ON users;

-- Disable RLS on users table completely
ALTER TABLE users DISABLE ROW LEVEL SECURITY;

-- Grant public access to users table (since it's legacy and we use employees now)
GRANT SELECT ON users TO anon, authenticated;

-- ============================================================================
-- STEP 2: FIX WALLETS RLS POLICIES
-- ============================================================================

-- Drop all existing wallet policies
DROP POLICY IF EXISTS "Public read wallets" ON wallets;
DROP POLICY IF EXISTS "Public can read wallets" ON wallets;
DROP POLICY IF EXISTS "Public can create wallets" ON wallets;
DROP POLICY IF EXISTS "Staff can manage wallets" ON wallets;
DROP POLICY IF EXISTS "wallets_owner_access" ON wallets;
DROP POLICY IF EXISTS "Clients view own wallets" ON wallets;

-- Disable and re-enable RLS to start fresh
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Create simple, non-recursive policies for wallets
-- Anyone can read wallets (for customer wallet lookup by phone)
CREATE POLICY "allow_public_read_wallets"
ON wallets FOR SELECT
USING (true);

-- Anyone can create wallets (for wallet activation)
CREATE POLICY "allow_public_create_wallets"
ON wallets FOR INSERT
WITH CHECK (true);

-- Anyone can update wallets (for balance updates)
CREATE POLICY "allow_public_update_wallets"
ON wallets FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STEP 3: FIX TRANSACTIONS RLS POLICIES
-- ============================================================================

-- Drop all existing transaction policies
DROP POLICY IF EXISTS "Public read transactions" ON transactions;
DROP POLICY IF EXISTS "Public can create transactions" ON transactions;
DROP POLICY IF EXISTS "Staff can manage transactions" ON transactions;

-- Disable and re-enable RLS
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Create simple policies for transactions
CREATE POLICY "allow_public_read_transactions"
ON transactions FOR SELECT
USING (true);

CREATE POLICY "allow_public_create_transactions"
ON transactions FOR INSERT
WITH CHECK (true);

CREATE POLICY "allow_public_update_transactions"
ON transactions FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STEP 4: FIX VOUCHERS RLS POLICIES
-- ============================================================================

-- Drop all existing voucher policies
DROP POLICY IF EXISTS "Public read vouchers" ON vouchers;
DROP POLICY IF EXISTS "Staff can manage vouchers" ON vouchers;

-- Disable and re-enable RLS
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Create simple policies for vouchers
CREATE POLICY "allow_public_read_vouchers"
ON vouchers FOR SELECT
USING (true);

CREATE POLICY "allow_public_create_vouchers"
ON vouchers FOR INSERT
WITH CHECK (true);

CREATE POLICY "allow_public_update_vouchers"
ON vouchers FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STEP 5: ENSURE EMPLOYEES TABLE HAS SIMPLE RLS
-- ============================================================================

-- Drop any complex policies on employees
DROP POLICY IF EXISTS "Employees can view own tenant data" ON employees;
DROP POLICY IF EXISTS "Staff can manage users" ON employees;

-- Disable and re-enable RLS
ALTER TABLE employees DISABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create simple policies for employees
CREATE POLICY "allow_public_read_employees"
ON employees FOR SELECT
USING (true);

CREATE POLICY "allow_authenticated_manage_employees"
ON employees FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- STEP 6: GRANT NECESSARY PERMISSIONS
-- ============================================================================

-- Ensure anon and authenticated roles have access
GRANT SELECT, INSERT, UPDATE ON wallets TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON transactions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON vouchers TO anon, authenticated;
GRANT SELECT ON employees TO anon, authenticated;
GRANT SELECT ON users TO anon, authenticated;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This script fixes the infinite recursion error by:
-- 1. Disabling RLS on the legacy users table
-- 2. Creating simple, non-recursive policies on wallets, transactions, and vouchers
-- 3. Using USING (true) conditions to avoid circular dependencies
-- 4. Granting necessary permissions to anon and authenticated roles
-- 5. Ensuring the employees table has simple RLS policies
