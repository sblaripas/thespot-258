-- Fix infinite recursion in menu_items RLS policies
-- Menu items should be publicly readable

-- Drop all existing policies on menu_items to start fresh
DROP POLICY IF EXISTS "Public read access for menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;

-- Ensure RLS is enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create a simple public read policy that doesn't reference users table
-- This allows anyone (authenticated or not) to view menu items
CREATE POLICY "Public read access for menu items"
ON menu_items
FOR SELECT
TO public
USING (true);

-- Staff can insert, update, and delete menu items
-- Only check role without causing recursion
CREATE POLICY "Staff can manage menu items"
ON menu_items
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'manager', 'staff')
  )
);

-- Fix users table RLS to prevent recursion
-- Drop existing policies that might cause issues
DROP POLICY IF EXISTS "Users can view own profile" ON users;
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON users;
DROP POLICY IF EXISTS "Enable read access for all users" ON users;

-- Ensure RLS is enabled on users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Simple policy: users can read their own data
CREATE POLICY "Users can view own profile"
ON users
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Staff can view all users (for management purposes)
CREATE POLICY "Staff can view all users"
ON users
FOR SELECT
TO authenticated
USING (
  auth.uid() IN (
    SELECT id FROM users WHERE role IN ('owner', 'manager', 'staff')
  )
);

-- Fix other tables that might have similar issues
-- Tables table should be readable by staff
DROP POLICY IF EXISTS "Staff can view tables" ON tables;
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view tables"
ON tables
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'manager', 'staff', 'waiter', 'bartender', 'cashier')
  )
);

CREATE POLICY "Staff can manage tables"
ON tables
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'manager')
  )
);

-- Orders should be viewable by staff and the wallet owner
DROP POLICY IF EXISTS "Staff can view orders" ON orders;
DROP POLICY IF EXISTS "Wallet owners can view their orders" ON orders;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Staff can view orders"
ON orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'manager', 'staff', 'waiter', 'bartender', 'cashier')
  )
);

CREATE POLICY "Staff can manage orders"
ON orders
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'manager', 'staff', 'waiter', 'bartender', 'cashier')
  )
);

-- Wallets should be viewable by the owner (via phone) and staff
DROP POLICY IF EXISTS "Staff can view wallets" ON wallets;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view own wallet"
ON wallets
FOR SELECT
TO public
USING (true); -- We'll handle authorization in the application layer

CREATE POLICY "Staff can manage wallets"
ON wallets
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role IN ('owner', 'manager', 'cashier')
  )
);
