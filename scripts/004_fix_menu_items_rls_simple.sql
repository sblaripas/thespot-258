-- Simple fix for menu_items infinite recursion
-- This removes all complex policies and allows public read access

-- Drop all existing policies on menu_items
DROP POLICY IF EXISTS "Public read access for menu items" ON menu_items;
DROP POLICY IF EXISTS "Staff can manage menu items" ON menu_items;
DROP POLICY IF EXISTS "Anyone can view menu items" ON menu_items;
DROP POLICY IF EXISTS "Enable read access for all users" ON menu_items;
DROP POLICY IF EXISTS "Public can read menu items" ON menu_items;

-- Ensure RLS is enabled
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;

-- Create a simple public read policy with NO user checks
-- This eliminates any possibility of recursion
CREATE POLICY "menu_items_public_read"
ON menu_items
FOR SELECT
USING (true);

-- Allow authenticated staff to insert/update/delete
-- Using a simple subquery that won't cause recursion
CREATE POLICY "menu_items_staff_write"
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
