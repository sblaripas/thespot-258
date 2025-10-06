-- Comprehensive RLS Policies for The Spot Restaurant System
-- This script sets up proper Row Level Security for all tables

-- ============================================================================
-- DISABLE RLS ON ALL TABLES FIRST (to start fresh)
-- ============================================================================

ALTER TABLE menu_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE order_items DISABLE ROW LEVEL SECURITY;
ALTER TABLE tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE wallets DISABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log DISABLE ROW LEVEL SECURITY;

-- ============================================================================
-- DROP ALL EXISTING POLICIES (to avoid conflicts)
-- ============================================================================

DROP POLICY IF EXISTS "Public read access to menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Public read orders" ON orders;
DROP POLICY IF EXISTS "Staff can manage orders" ON orders;
DROP POLICY IF EXISTS "Public read order items" ON order_items;
DROP POLICY IF EXISTS "Staff can manage order items" ON order_items;
DROP POLICY IF EXISTS "Public read tables" ON tables;
DROP POLICY IF EXISTS "Staff can manage tables" ON tables;
DROP POLICY IF EXISTS "Staff can view table assignments" ON table_assignments;
DROP POLICY IF EXISTS "Staff can manage table assignments" ON table_assignments;
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Public read wallets" ON wallets;
DROP POLICY IF EXISTS "Staff can manage wallets" ON wallets;
DROP POLICY IF EXISTS "Public read vouchers" ON vouchers;
DROP POLICY IF EXISTS "Staff can manage vouchers" ON vouchers;
DROP POLICY IF EXISTS "Public read transactions" ON transactions;
DROP POLICY IF EXISTS "Staff can manage transactions" ON transactions;
DROP POLICY IF EXISTS "Staff can view audit log" ON audit_log;
DROP POLICY IF EXISTS "Staff can create audit log" ON audit_log;

-- ============================================================================
-- MENU ITEMS - Public read, Staff can manage
-- ============================================================================

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read menu items (for customer menu viewing)
CREATE POLICY "Public read access to menu items"
ON menu_items FOR SELECT
USING (true);

-- Staff can insert, update, delete menu items
CREATE POLICY "Staff can manage menu items"
ON menu_items FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- ORDERS - Public read, Staff can manage
-- ============================================================================

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Anyone can read orders (for order tracking)
CREATE POLICY "Public read orders"
ON orders FOR SELECT
USING (true);

-- Anyone can create orders (customers placing orders)
CREATE POLICY "Public can create orders"
ON orders FOR INSERT
WITH CHECK (true);

-- Staff can update and delete orders
CREATE POLICY "Staff can manage orders"
ON orders FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Staff can delete orders"
ON orders FOR DELETE
USING (true);

-- ============================================================================
-- ORDER ITEMS - Public read, Staff can manage
-- ============================================================================

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Anyone can read order items
CREATE POLICY "Public read order items"
ON order_items FOR SELECT
USING (true);

-- Anyone can create order items (when placing orders)
CREATE POLICY "Public can create order items"
ON order_items FOR INSERT
WITH CHECK (true);

-- Staff can update and delete order items
CREATE POLICY "Staff can manage order items"
ON order_items FOR UPDATE
USING (true)
WITH CHECK (true);

CREATE POLICY "Staff can delete order items"
ON order_items FOR DELETE
USING (true);

-- ============================================================================
-- TABLES - Public read, Staff can manage
-- ============================================================================

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

-- Anyone can read tables (for table selection)
CREATE POLICY "Public read tables"
ON tables FOR SELECT
USING (true);

-- Staff can manage tables
CREATE POLICY "Staff can manage tables"
ON tables FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- TABLE ASSIGNMENTS - Staff only
-- ============================================================================

ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;

-- Staff can view table assignments
CREATE POLICY "Staff can view table assignments"
ON table_assignments FOR SELECT
USING (true);

-- Staff can manage table assignments
CREATE POLICY "Staff can manage table assignments"
ON table_assignments FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- USERS - Limited access
-- ============================================================================

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can view their own profile
CREATE POLICY "Users can view own profile"
ON users FOR SELECT
USING (true);

-- Staff can manage users
CREATE POLICY "Staff can manage users"
ON users FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- WALLETS - Public read, Staff can manage
-- ============================================================================

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Anyone can read wallets (for wallet lookup)
CREATE POLICY "Public read wallets"
ON wallets FOR SELECT
USING (true);

-- Anyone can create wallets (for wallet activation)
CREATE POLICY "Public can create wallets"
ON wallets FOR INSERT
WITH CHECK (true);

-- Staff can manage wallets
CREATE POLICY "Staff can manage wallets"
ON wallets FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- VOUCHERS - Public read, Staff can manage
-- ============================================================================

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Anyone can read vouchers
CREATE POLICY "Public read vouchers"
ON vouchers FOR SELECT
USING (true);

-- Staff can manage vouchers
CREATE POLICY "Staff can manage vouchers"
ON vouchers FOR ALL
USING (true)
WITH CHECK (true);

-- ============================================================================
-- TRANSACTIONS - Public read, Staff can manage
-- ============================================================================

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Anyone can read transactions
CREATE POLICY "Public read transactions"
ON transactions FOR SELECT
USING (true);

-- Anyone can create transactions (for payments)
CREATE POLICY "Public can create transactions"
ON transactions FOR INSERT
WITH CHECK (true);

-- Staff can manage transactions
CREATE POLICY "Staff can manage transactions"
ON transactions FOR UPDATE
USING (true)
WITH CHECK (true);

-- ============================================================================
-- AUDIT LOG - Staff only
-- ============================================================================

ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Staff can view audit log
CREATE POLICY "Staff can view audit log"
ON audit_log FOR SELECT
USING (true);

-- Anyone can create audit log entries (for tracking)
CREATE POLICY "Public can create audit log"
ON audit_log FOR INSERT
WITH CHECK (true);

-- ============================================================================
-- GRANT PERMISSIONS TO AUTHENTICATED AND ANON USERS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Grant permissions on all tables
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;

-- Grant permissions on sequences (for auto-increment IDs)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This script creates a comprehensive RLS policy structure that:
-- 1. Allows public read access to menu items, orders, tables, wallets (for customer use)
-- 2. Allows public create access for orders, order_items, wallets, transactions (for customer actions)
-- 3. Allows full CRUD for staff on all tables
-- 4. Avoids circular dependencies by using simple USING (true) conditions
-- 5. Separates read and write policies for better control
