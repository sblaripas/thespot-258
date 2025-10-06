-- Create tables table for restaurant table management
CREATE TABLE IF NOT EXISTS tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_number INTEGER UNIQUE NOT NULL CHECK (table_number >= 1 AND table_number <= 12),
  qr_code VARCHAR UNIQUE NOT NULL,
  status VARCHAR NOT NULL DEFAULT 'free' CHECK (status IN ('free', 'occupied', 'reserved')),
  assigned_waiter_id UUID REFERENCES users(id),
  current_order_id UUID REFERENCES orders(id),
  occupied_since TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add table_id to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS table_id UUID REFERENCES tables(id);

-- Add modifiers column to order_items for customizations
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS modifiers JSONB DEFAULT '[]';

-- Create table_assignments table for tracking waiter assignments
CREATE TABLE IF NOT EXISTS table_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_id UUID REFERENCES tables(id) NOT NULL,
  waiter_id UUID REFERENCES users(id) NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES users(id),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create audit_log table for tracking actions
CREATE TABLE IF NOT EXISTS audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  action VARCHAR NOT NULL,
  entity_type VARCHAR NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert 12 tables with QR codes
INSERT INTO tables (table_number, qr_code, status) VALUES
  (1, 'TABLE-001-QR', 'free'),
  (2, 'TABLE-002-QR', 'free'),
  (3, 'TABLE-003-QR', 'free'),
  (4, 'TABLE-004-QR', 'free'),
  (5, 'TABLE-005-QR', 'free'),
  (6, 'TABLE-006-QR', 'free'),
  (7, 'TABLE-007-QR', 'free'),
  (8, 'TABLE-008-QR', 'free'),
  (9, 'TABLE-009-QR', 'free'),
  (10, 'TABLE-010-QR', 'free'),
  (11, 'TABLE-011-QR', 'free'),
  (12, 'TABLE-012-QR', 'free')
ON CONFLICT (table_number) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- RLS policies for tables (publicly readable for menu access)
CREATE POLICY "Tables are viewable by everyone" ON tables FOR SELECT USING (true);
CREATE POLICY "Tables are updatable by staff" ON tables FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('waiter', 'manager', 'owner', 'cashier')
  )
);

-- RLS policies for table_assignments
CREATE POLICY "Table assignments viewable by staff" ON table_assignments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('waiter', 'manager', 'owner')
  )
);
CREATE POLICY "Table assignments manageable by managers" ON table_assignments FOR ALL USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('manager', 'owner')
  )
);

-- RLS policies for audit_log
CREATE POLICY "Audit logs viewable by managers" ON audit_log FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role IN ('manager', 'owner')
  )
);
CREATE POLICY "Audit logs insertable by all authenticated users" ON audit_log FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_tables_status ON tables(status);
CREATE INDEX IF NOT EXISTS idx_tables_waiter ON tables(assigned_waiter_id);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_table_assignments_waiter ON table_assignments(waiter_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_user ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);
