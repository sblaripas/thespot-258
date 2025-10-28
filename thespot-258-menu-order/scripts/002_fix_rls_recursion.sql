-- Fix infinite recursion in RLS policies
-- This script simplifies the policies to avoid circular dependencies

-- ============================================
-- MENU ITEMS - Public read access
-- ============================================
DROP POLICY IF EXISTS "Public read access for menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;

ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read menu items (no authentication required)
CREATE POLICY "Public read access for menu items"
ON menu_items
FOR SELECT
USING (true);

-- Staff can manage menu items (simple check without recursion)
CREATE POLICY "Staff can manage menu items"
ON menu_items
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager', 'staff')
);

-- ============================================
-- USERS - Simplified policies
-- ============================================
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Staff can view all users" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (id = auth.uid());

-- Users can update their own data
CREATE POLICY "Users can update own profile"
ON users
FOR UPDATE
TO authenticated
USING (id = auth.uid());

-- ============================================
-- TABLES - Staff access
-- ============================================
DROP POLICY IF EXISTS "Staff can view tables" ON tables;
DROP POLICY IF EXISTS "Staff can manage tables" ON tables;

ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can access tables"
ON tables
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager', 'staff', 'waiter', 'bartender', 'cashier')
);

-- ============================================
-- ORDERS - Staff and wallet owner access
-- ============================================
DROP POLICY IF EXISTS "Staff can view orders" ON orders;
DROP POLICY IF EXISTS "Staff can manage orders" ON orders;
DROP POLICY IF EXISTS "Wallet owners can view their orders" ON orders;

ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can access orders"
ON orders
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager', 'staff', 'waiter', 'bartender', 'cashier')
);

-- ============================================
-- WALLETS - Public read, staff manage
-- ============================================
DROP POLICY IF EXISTS "Staff can view wallets" ON wallets;
DROP POLICY IF EXISTS "Staff can manage wallets" ON wallets;
DROP POLICY IF EXISTS "Public can view own wallet" ON wallets;

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Allow public to read wallets (authorization handled in app)
CREATE POLICY "Public can read wallets"
ON wallets
FOR SELECT
USING (true);

-- Staff can manage wallets
CREATE POLICY "Staff can manage wallets"
ON wallets
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager', 'cashier')
);

-- ============================================
-- ORDER ITEMS - Staff access
-- ============================================
DROP POLICY IF EXISTS "Staff can access order items" ON order_items;

ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can access order items"
ON order_items
FOR ALL
TO authenticated
USING (
  (SELECT role FROM users WHERE id = auth.uid()) IN ('owner', 'manager', 'staff', 'waiter', 'bartender', 'cashier')
);
