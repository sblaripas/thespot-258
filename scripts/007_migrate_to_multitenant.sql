-- ========================
-- MIGRATION TO MULTI-TENANT SCHEMA
-- ========================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================
-- STEP 1: CREATE NEW TABLES
-- ========================

-- Tenants Table
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    legal_name TEXT,
    domain TEXT UNIQUE NOT NULL,
    province TEXT NOT NULL CHECK (province IN (
        'Maputo', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 
        'Tete', 'Zambézia', 'Nampula', 'Cabo Delgado', 'Niassa'
    )),
    city TEXT NOT NULL,
    address TEXT,
    phone TEXT,
    email TEXT,
    timezone TEXT DEFAULT 'Africa/Maputo',
    base_language TEXT DEFAULT 'pt' CHECK (base_language IN ('pt', 'en')),
    currency TEXT DEFAULT 'MZN',
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Settings
CREATE TABLE IF NOT EXISTS tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    languages TEXT[] DEFAULT '{"pt", "en"}',
    default_language TEXT DEFAULT 'pt',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '24h',
    opening_time TIME DEFAULT '07:00',
    closing_time TIME DEFAULT '22:00',
    tax_enabled BOOLEAN DEFAULT TRUE,
    tax_rate NUMERIC(5,2) DEFAULT 17.00,
    tax_name TEXT DEFAULT 'IVA',
    receipt_header_pt TEXT,
    receipt_header_en TEXT,
    receipt_footer_pt TEXT,
    receipt_footer_en TEXT,
    receipt_show_tax BOOLEAN DEFAULT TRUE,
    auto_table_status BOOLEAN DEFAULT TRUE,
    table_timeout_minutes INTEGER DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    can_manage_orders BOOLEAN DEFAULT FALSE,
    can_manage_tables BOOLEAN DEFAULT FALSE,
    can_manage_menu BOOLEAN DEFAULT FALSE,
    can_manage_inventory BOOLEAN DEFAULT FALSE,
    can_manage_staff BOOLEAN DEFAULT FALSE,
    can_view_reports BOOLEAN DEFAULT FALSE,
    can_manage_settings BOOLEAN DEFAULT FALSE,
    access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name_pt),
    UNIQUE (tenant_id, name_en)
);

-- Employees Table
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    pin_hash TEXT,
    language_preference TEXT DEFAULT 'pt' CHECK (language_preference IN ('pt', 'en')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, phone)
);

-- Categories Table
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    display_order INTEGER DEFAULT 0,
    image_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name_pt),
    UNIQUE (tenant_id, name_en)
);

-- ========================
-- STEP 2: BACKUP AND MIGRATE EXISTING DATA
-- ========================

-- Create default tenant for existing data
INSERT INTO tenants (id, name, domain, province, city, legal_name)
VALUES (
    '00000000-0000-0000-0000-000000000001'::UUID,
    'The Spot',
    'thespot.mz',
    'Maputo',
    'Maputo',
    'The Spot - Restaurante e Bar'
) ON CONFLICT DO NOTHING;

-- Create default tenant settings
INSERT INTO tenant_settings (tenant_id)
VALUES ('00000000-0000-0000-0000-000000000001'::UUID)
ON CONFLICT DO NOTHING;

-- ========================
-- STEP 3: ALTER EXISTING TABLES
-- ========================

-- Add tenant_id to menu_items if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='menu_items' AND column_name='tenant_id') THEN
        ALTER TABLE menu_items ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        UPDATE menu_items SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
        ALTER TABLE menu_items ALTER COLUMN tenant_id SET NOT NULL;
    END IF;
    
    -- Add bilingual fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='menu_items' AND column_name='name_pt') THEN
        ALTER TABLE menu_items ADD COLUMN name_pt TEXT;
        ALTER TABLE menu_items ADD COLUMN name_en TEXT;
        ALTER TABLE menu_items ADD COLUMN description_pt TEXT;
        ALTER TABLE menu_items ADD COLUMN description_en TEXT;
        
        -- Migrate existing data (assuming current data is in Portuguese)
        UPDATE menu_items SET name_pt = name, name_en = name WHERE name_pt IS NULL;
        UPDATE menu_items SET description_pt = description, description_en = description WHERE description_pt IS NULL;
        
        ALTER TABLE menu_items ALTER COLUMN name_pt SET NOT NULL;
        ALTER TABLE menu_items ALTER COLUMN name_en SET NOT NULL;
    END IF;
    
    -- Rename price fields
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='menu_items' AND column_name='price') THEN
        ALTER TABLE menu_items RENAME COLUMN price TO selling_price;
    END IF;
    
    -- Add new pricing fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='menu_items' AND column_name='cost_price') THEN
        ALTER TABLE menu_items ADD COLUMN cost_price NUMERIC(10, 2) DEFAULT 0 CHECK (cost_price >= 0);
        UPDATE menu_items SET cost_price = selling_price * 0.4 WHERE cost_price = 0;
        ALTER TABLE menu_items ALTER COLUMN cost_price SET NOT NULL;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='menu_items' AND column_name='discount_price') THEN
        ALTER TABLE menu_items ADD COLUMN discount_price NUMERIC(10, 2) CHECK (discount_price >= 0);
        ALTER TABLE menu_items ADD COLUMN show_discount BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- Rename stock_quantity to stock_count
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='menu_items' AND column_name='stock_quantity') THEN
        ALTER TABLE menu_items RENAME COLUMN stock_quantity TO stock_count;
    END IF;
    
    -- Add inventory tracking fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='menu_items' AND column_name='track_stock') THEN
        ALTER TABLE menu_items ADD COLUMN track_stock BOOLEAN DEFAULT FALSE;
        ALTER TABLE menu_items ADD COLUMN low_stock_threshold INTEGER DEFAULT 10;
        ALTER TABLE menu_items ADD COLUMN allow_out_of_stock_orders BOOLEAN DEFAULT FALSE;
    END IF;
END $$;

-- Add tenant_id to restaurant_tables (renamed from tables)
DO $$
BEGIN
    -- Rename tables to restaurant_tables if needed
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='tables') 
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name='restaurant_tables') THEN
        ALTER TABLE tables RENAME TO restaurant_tables;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='restaurant_tables' AND column_name='tenant_id') THEN
        ALTER TABLE restaurant_tables ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        UPDATE restaurant_tables SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
        ALTER TABLE restaurant_tables ALTER COLUMN tenant_id SET NOT NULL;
    END IF;
    
    -- Rename table_number to number and change type
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='restaurant_tables' AND column_name='table_number') THEN
        ALTER TABLE restaurant_tables ALTER COLUMN table_number TYPE TEXT;
        ALTER TABLE restaurant_tables RENAME COLUMN table_number TO number;
    END IF;
    
    -- Add bilingual name fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='restaurant_tables' AND column_name='name_pt') THEN
        ALTER TABLE restaurant_tables ADD COLUMN name_pt TEXT;
        ALTER TABLE restaurant_tables ADD COLUMN name_en TEXT;
    END IF;
    
    -- Add new table fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='restaurant_tables' AND column_name='capacity') THEN
        ALTER TABLE restaurant_tables ADD COLUMN capacity INTEGER DEFAULT 4 CHECK (capacity > 0);
        ALTER TABLE restaurant_tables ADD COLUMN min_capacity INTEGER DEFAULT 1;
        ALTER TABLE restaurant_tables ADD COLUMN max_capacity INTEGER;
        ALTER TABLE restaurant_tables ADD COLUMN location_zone TEXT;
        ALTER TABLE restaurant_tables ADD COLUMN shape TEXT DEFAULT 'rectangle';
        ALTER TABLE restaurant_tables ADD COLUMN dimensions JSONB;
    END IF;
END $$;

-- Add tenant_id and update orders table
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='tenant_id') THEN
        ALTER TABLE orders ADD COLUMN tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
        UPDATE orders SET tenant_id = '00000000-0000-0000-0000-000000000001'::UUID WHERE tenant_id IS NULL;
        ALTER TABLE orders ALTER COLUMN tenant_id SET NOT NULL;
    END IF;
    
    -- Add order_number field
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='order_number') THEN
        ALTER TABLE orders ADD COLUMN order_number TEXT UNIQUE;
        -- Generate order numbers for existing orders
        UPDATE orders SET order_number = 'TSP-' || TO_CHAR(created_at, 'YYMM') || '-' || LPAD(id::text, 4, '0') 
        WHERE order_number IS NULL;
        ALTER TABLE orders ALTER COLUMN order_number SET NOT NULL;
    END IF;
    
    -- Rename waiter/staff references
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name='orders' AND column_name='staff_id') THEN
        ALTER TABLE orders RENAME COLUMN staff_id TO waiter_id;
    END IF;
    
    -- Add pricing breakdown fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='subtotal') THEN
        ALTER TABLE orders ADD COLUMN subtotal NUMERIC(10, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN tax_amount NUMERIC(10, 2) DEFAULT 0;
        ALTER TABLE orders ADD COLUMN discount_amount NUMERIC(10, 2) DEFAULT 0;
        -- Calculate from existing total_amount
        UPDATE orders SET subtotal = total_amount WHERE subtotal = 0;
    END IF;
    
    -- Add timestamp fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='placed_at') THEN
        ALTER TABLE orders ADD COLUMN placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE orders ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE orders ADD COLUMN prepared_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE orders ADD COLUMN served_at TIMESTAMP WITH TIME ZONE;
        ALTER TABLE orders ADD COLUMN completed_at TIMESTAMP WITH TIME ZONE;
    END IF;
    
    -- Add bilingual notes
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='orders' AND column_name='notes_pt') THEN
        ALTER TABLE orders ADD COLUMN notes_pt TEXT;
        ALTER TABLE orders ADD COLUMN notes_en TEXT;
        ALTER TABLE orders ADD COLUMN customer_notes TEXT;
        -- Migrate existing notes
        UPDATE orders SET notes_pt = notes, customer_notes = notes WHERE notes IS NOT NULL;
    END IF;
    
    -- Update order type values
    UPDATE orders SET type = 'dine-in' WHERE type = 'table';
    UPDATE orders SET type = 'takeaway' WHERE type = 'pos';
END $$;

-- Update order_items table
DO $$
BEGIN
    -- Add price snapshot fields
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='order_items' AND column_name='cost_price_at_time') THEN
        ALTER TABLE order_items ADD COLUMN cost_price_at_time NUMERIC(10, 2);
        ALTER TABLE order_items ADD COLUMN selling_price_at_time NUMERIC(10, 2);
        -- Set from current unit_price
        UPDATE order_items SET selling_price_at_time = unit_price, cost_price_at_time = unit_price * 0.4 
        WHERE selling_price_at_time IS NULL;
        ALTER TABLE order_items ALTER COLUMN cost_price_at_time SET NOT NULL;
        ALTER TABLE order_items ALTER COLUMN selling_price_at_time SET NOT NULL;
    END IF;
    
    -- Add bilingual instructions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='order_items' AND column_name='special_instructions_pt') THEN
        ALTER TABLE order_items ADD COLUMN special_instructions_pt TEXT;
        ALTER TABLE order_items ADD COLUMN special_instructions_en TEXT;
    END IF;
    
    -- Add subtotal as generated column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='order_items' AND column_name='subtotal') THEN
        ALTER TABLE order_items ADD COLUMN subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED;
    END IF;
END $$;

-- ========================
-- STEP 4: CREATE NEW SUPPORTING TABLES
-- ========================

-- Table Reservations
CREATE TABLE IF NOT EXISTS table_reservations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    customer_email TEXT,
    party_size INTEGER NOT NULL CHECK (party_size > 0),
    reservation_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INTEGER DEFAULT 120,
    status TEXT DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'seated', 'cancelled', 'no-show')),
    notes TEXT,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    bill_number TEXT UNIQUE NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN (
        'cash', 'card', 'mobile_money', 'bank_transfer', 'multicaixa'
    )),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    amount_paid NUMERIC(10, 2) NOT NULL CHECK (amount_paid >= 0),
    tip_amount NUMERIC(10, 2) DEFAULT 0 CHECK (tip_amount >= 0),
    change_amount NUMERIC(10, 2) DEFAULT 0 CHECK (change_amount >= 0),
    transaction_id TEXT,
    card_last_four TEXT,
    paid_at TIMESTAMP WITH TIME ZONE,
    cashier_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    change_type TEXT NOT NULL CHECK (change_type IN (
        'sale', 'purchase', 'waste', 'adjustment', 'transfer', 'production'
    )),
    change_amount INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    new_stock INTEGER NOT NULL,
    reason_pt TEXT,
    reason_en TEXT,
    cost_impact NUMERIC(10, 2) DEFAULT 0,
    reference_id UUID,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts Management
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    shift_number TEXT NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE RESTRICT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    opening_balance NUMERIC(10, 2) DEFAULT 0,
    closing_balance NUMERIC(10, 2),
    expected_cash NUMERIC(10, 2),
    actual_cash NUMERIC(10, 2),
    cash_difference NUMERIC(10, 2),
    total_sales NUMERIC(10, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending_review')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, shift_number)
);

-- Translations Table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    module TEXT NOT NULL,
    text_pt TEXT NOT NULL,
    text_en TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, key, module)
);

-- ========================
-- STEP 5: CREATE INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tables_tenant ON restaurant_tables(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item ON inventory_logs(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created ON inventory_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_shifts_date ON shifts(start_time);

-- ========================
-- STEP 6: CREATE TRIGGERS
-- ========================

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_tenants_updated ON tenants;
CREATE TRIGGER trigger_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_employees_updated ON employees;
CREATE TRIGGER trigger_employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_menu_items_updated ON menu_items;
CREATE TRIGGER trigger_menu_items_updated BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_orders_updated ON orders;
CREATE TRIGGER trigger_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS trigger_roles_updated ON roles;
CREATE TRIGGER trigger_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Stock update trigger
CREATE OR REPLACE FUNCTION update_menu_item_stock()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE menu_items 
    SET stock_count = NEW.new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.menu_item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_stock ON inventory_logs;
CREATE TRIGGER trigger_update_stock AFTER INSERT ON inventory_logs FOR EACH ROW EXECUTE FUNCTION update_menu_item_stock();

-- ========================
-- STEP 7: CREATE VIEWS
-- ========================

CREATE OR REPLACE VIEW daily_sales_summary AS
SELECT 
    tenant_id,
    DATE(created_at) AS sale_date,
    COUNT(*) AS total_orders,
    SUM(total_amount) AS total_revenue,
    SUM(tax_amount) AS total_tax,
    SUM(discount_amount) AS total_discount,
    AVG(total_amount) AS average_order_value,
    COUNT(DISTINCT table_id) AS tables_served
FROM orders 
WHERE status = 'completed'
GROUP BY tenant_id, DATE(created_at);

CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    mi.tenant_id,
    mi.id AS menu_item_id,
    mi.name_pt,
    mi.name_en,
    mi.stock_count,
    mi.low_stock_threshold,
    mi.track_stock
FROM menu_items mi
WHERE mi.track_stock = TRUE 
  AND mi.stock_count <= mi.low_stock_threshold
  AND mi.is_available = TRUE;

CREATE OR REPLACE VIEW employee_performance AS
SELECT 
    e.tenant_id,
    e.id AS employee_id,
    e.name,
    r.name_pt AS role_name_pt,
    r.name_en AS role_name_en,
    COUNT(o.id) AS orders_handled,
    SUM(o.total_amount) AS total_sales,
    AVG(o.total_amount) AS average_order_value
FROM employees e
LEFT JOIN orders o ON e.id = o.waiter_id AND o.status = 'completed'
LEFT JOIN roles r ON e.role_id = r.id
GROUP BY e.tenant_id, e.id, e.name, r.name_pt, r.name_en;

-- ========================
-- STEP 8: SEED DEFAULT ROLES
-- ========================

INSERT INTO roles (tenant_id, name_pt, name_en, color, can_manage_orders, can_manage_tables, can_manage_menu, can_manage_inventory, can_manage_staff, can_view_reports, can_manage_settings, access_level)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Administrador', 'Administrator', '#EF4444', true, true, true, true, true, true, true, 5),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Gerente', 'Manager', '#F59E0B', true, true, true, true, true, true, false, 4),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Garçom', 'Waiter', '#10B981', true, true, false, false, false, false, false, 2),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Barman', 'Bartender', '#3B82F6', true, false, false, true, false, false, false, 2),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Cozinheiro', 'Chef', '#8B5CF6', true, false, false, true, false, false, false, 2),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Caixa', 'Cashier', '#EC4899', true, false, false, false, false, true, false, 3)
ON CONFLICT DO NOTHING;

-- ========================
-- STEP 9: SEED DEFAULT CATEGORIES
-- ========================

INSERT INTO categories (tenant_id, name_pt, name_en, display_order)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Bebidas', 'Drinks', 1),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Comida', 'Food', 2),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Sobremesas', 'Desserts', 3),
    ('00000000-0000-0000-0000-000000000001'::UUID, 'Entradas', 'Appetizers', 4)
ON CONFLICT DO NOTHING;

-- ========================
-- MIGRATION COMPLETE
-- ========================
