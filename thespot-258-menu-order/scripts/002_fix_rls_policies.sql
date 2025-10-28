-- Fix RLS policies to prevent infinite recursion
-- Make menu_items table publicly readable since it's public information

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "menu_items_select_policy" ON menu_items;
DROP POLICY IF EXISTS "menu_items_public_read" ON menu_items;

-- Create a simple public read policy for menu_items
CREATE POLICY "menu_items_public_read" ON menu_items
    FOR SELECT USING (true);

-- Ensure RLS is enabled but allow public read access
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- For other tables, ensure they have proper policies without circular references
-- Users table should allow users to read their own data
DROP POLICY IF EXISTS "users_own_data" ON users;
CREATE POLICY "users_own_data" ON users
    FOR ALL USING (auth.uid() = id);

-- Wallets should be accessible by their owners
DROP POLICY IF EXISTS "wallets_owner_access" ON wallets;
CREATE POLICY "wallets_owner_access" ON wallets
    FOR ALL USING (auth.uid() = user_id);

-- Orders should be accessible by their owners and staff
DROP POLICY IF EXISTS "orders_access" ON orders;
CREATE POLICY "orders_access" ON orders
    FOR ALL USING (
        auth.uid() = client_id OR 
        auth.uid() = staff_id OR
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'barman', 'waiter')
        )
    );

-- Vouchers should be publicly readable for scanning, but only staff can modify
DROP POLICY IF EXISTS "vouchers_public_read" ON vouchers;
DROP POLICY IF EXISTS "vouchers_staff_modify" ON vouchers;

CREATE POLICY "vouchers_public_read" ON vouchers
    FOR SELECT USING (true);

CREATE POLICY "vouchers_staff_modify" ON vouchers
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.id = auth.uid() 
            AND users.role IN ('admin', 'barman', 'waiter')
        )
    );
