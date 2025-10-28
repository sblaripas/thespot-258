-- ========================
-- RESTAURANTOS COMPREHENSIVE SCHEMA MIGRATION
-- This script migrates the existing database to the full RestaurantOS schema
-- with multi-tenancy, enhanced inventory, payments, and Mozambique compliance
-- ========================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================
-- STEP 1: CREATE NEW CORE TABLES
-- ========================

-- Tenants Table (Restaurant Groups/Chains)
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
    nuit TEXT,
    licenca TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Settings Table
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
    payment_methods_enabled TEXT[] DEFAULT '{"M-Pesa", "e-Mola", "wallet", "cash", "card"}',
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

-- Subscriptions Table
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    features_enabled JSONB DEFAULT '{}',
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
    can_issue_vouchers BOOLEAN DEFAULT FALSE,
    can_manage_qr_menus BOOLEAN DEFAULT FALSE,
    access_level INTEGER DEFAULT 1 CHECK (access_level BETWEEN 1 AND 5),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name_pt),
    UNIQUE (tenant_id, name_en)
);

-- Employees Table (replaces users)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    password TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    pin_hash TEXT,
    assigned_zones TEXT[],
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

-- Suppliers Table
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    payment_terms TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Allergens Table
CREATE TABLE IF NOT EXISTS allergens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders Table
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_delivery DATE,
    items JSONB NOT NULL,
    total_cost NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant Tables (enhanced version of tables)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    number TEXT NOT NULL,
    name_pt TEXT,
    name_en TEXT,
    qr_code_url TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'maintenance')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    min_capacity INTEGER DEFAULT 1 CHECK (min_capacity >= 1),
    max_capacity INTEGER CHECK (max_capacity >= min_capacity),
    location_zone TEXT,
    position_x INTEGER,
    position_y INTEGER,
    shape TEXT DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'square')),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, number)
);

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
    confirmation_code TEXT,
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
        'cash', 'card', 'mobile_money', 'bank_transfer', 'multicaixa', 'wallet'
    )),
    mobile_money_ref TEXT,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
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

-- Inventory Logs Table
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE,
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
    reference_type TEXT,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts Table
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
    total_tips NUMERIC(10, 2) DEFAULT 0,
    total_discounts NUMERIC(10, 2) DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending_review')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, shift_number)
);

-- Menu Item Allergens Junction Table
CREATE TABLE IF NOT EXISTS menu_item_allergens (
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    allergen_id UUID REFERENCES allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);

-- ========================
-- STEP 2: CREATE DEFAULT TENANT AND MIGRATE DATA
-- ========================

-- Insert default tenant (The Spot)
INSERT INTO tenants (id, name, legal_name, domain, province, city, address, phone, email, nuit, is_active, subscription_tier)
VALUES (
    '00000000-0000-0000-0000-000000000001'::uuid,
    'The Spot',
    'The Spot Restaurante e Bar Lda',
    'thespot.mz',
    'Maputo',
    'Maputo',
    'Av. Julius Nyerere, Maputo',
    '+258 84 123 4567',
    'info@thespot.mz',
    '123456789',
    TRUE,
    'pro'
) ON CONFLICT (id) DO NOTHING;

-- Insert default tenant settings
INSERT INTO tenant_settings (tenant_id)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid)
ON CONFLICT (tenant_id) DO NOTHING;

-- Insert default subscription
INSERT INTO subscriptions (tenant_id, start_date, status)
VALUES ('00000000-0000-0000-0000-000000000001'::uuid, CURRENT_DATE, 'active');

-- ========================
-- STEP 3: CREATE DEFAULT ROLES
-- ========================

INSERT INTO roles (tenant_id, name_pt, name_en, color, can_manage_orders, can_manage_tables, can_manage_menu, can_manage_inventory, can_manage_staff, can_view_reports, can_manage_settings, can_issue_vouchers, can_manage_qr_menus, access_level)
VALUES 
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Administrador', 'Administrator', '#EF4444', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 5),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Gerente', 'Manager', '#F59E0B', TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, 4),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Barman', 'Bartender', '#10B981', TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, FALSE, TRUE, FALSE, 3),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Garçom', 'Waiter', '#3B82F6', TRUE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 2),
    ('00000000-0000-0000-0000-000000000001'::uuid, 'Caixa', 'Cashier', '#8B5CF6', TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, FALSE, 1)
ON CONFLICT DO NOTHING;

-- ========================
-- STEP 4: MIGRATE EXISTING USERS TO EMPLOYEES
-- ========================

-- Migrate users to employees with role mapping
INSERT INTO employees (id, tenant_id, name, phone, password, role_id, is_active, created_at, updated_at)
SELECT 
    u.id,
    '00000000-0000-0000-0000-000000000001'::uuid,
    u.name,
    u.phone,
    u.otp,  -- Migrate OTP as password temporarily
    (SELECT id FROM roles WHERE tenant_id = '00000000-0000-0000-0000-000000000001'::uuid AND 
        CASE 
            WHEN u.role = 'admin' THEN name_en = 'Administrator'
            WHEN u.role = 'barman' THEN name_en = 'Bartender'
            WHEN u.role = 'staff' THEN name_en = 'Waiter'
            WHEN u.role = 'teller' THEN name_en = 'Cashier'
            ELSE name_en = 'Waiter'
        END
    LIMIT 1),
    TRUE,
    u.created_at,
    u.updated_at
FROM users u
ON CONFLICT (id) DO NOTHING;

-- ========================
-- STEP 5: ADD TENANT_ID TO EXISTING TABLES
-- ========================

-- Add tenant_id to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE inventory_items SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;
ALTER TABLE inventory_items ALTER COLUMN tenant_id SET NOT NULL;

-- Add supplier_id to inventory_items
ALTER TABLE inventory_items ADD COLUMN IF NOT EXISTS supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL;

-- Add waste_factor to item_components
ALTER TABLE item_components ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE item_components ADD COLUMN IF NOT EXISTS waste_factor NUMERIC DEFAULT 0;
ALTER TABLE item_components ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE item_components SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to stock_adjustments
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE stock_adjustments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE stock_adjustments SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to production_batches
ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS cost_total NUMERIC DEFAULT 0;
ALTER TABLE production_batches ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE production_batches SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to inventory_counts
ALTER TABLE inventory_counts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE inventory_counts ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE inventory_counts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE inventory_counts SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to inventory_count_items
ALTER TABLE inventory_count_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE inventory_count_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE inventory_count_items SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to low_stock_alerts
ALTER TABLE low_stock_alerts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE low_stock_alerts ADD COLUMN IF NOT EXISTS notification_method TEXT DEFAULT 'app';
ALTER TABLE low_stock_alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE low_stock_alerts SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Enhance menu_items with bilingual fields and more metadata
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_pt TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_pt TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES categories(id) ON DELETE SET NULL;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS size TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS selling_price NUMERIC(10, 2);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS discount_price NUMERIC(10, 2);
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS show_discount BOOLEAN DEFAULT FALSE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS track_stock BOOLEAN DEFAULT FALSE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS stock_count INTEGER DEFAULT 0;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS low_stock_threshold INTEGER DEFAULT 10;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS allow_out_of_stock_orders BOOLEAN DEFAULT FALSE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS event_eligible BOOLEAN DEFAULT FALSE;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS preparation_time INTEGER;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS variants JSONB DEFAULT '{}';
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tags TEXT[];

-- Migrate existing menu_items data
UPDATE menu_items SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;
UPDATE menu_items SET name_pt = name WHERE name_pt IS NULL;
UPDATE menu_items SET name_en = name WHERE name_en IS NULL;
UPDATE menu_items SET description_pt = description WHERE description_pt IS NULL;
UPDATE menu_items SET description_en = description WHERE description_en IS NULL;
UPDATE menu_items SET selling_price = price WHERE selling_price IS NULL;
UPDATE menu_items SET stock_count = COALESCE(stock_quantity, 0) WHERE stock_count = 0;
UPDATE menu_items SET low_stock_threshold = COALESCE(min_stock_alert, 10) WHERE low_stock_threshold = 10;

-- Enhance orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_number TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_id UUID;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS waiter_id UUID REFERENCES employees(id) ON DELETE SET NULL;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS qr_scan_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'dine-in';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS guest_count INTEGER DEFAULT 1;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tax_compliant BOOLEAN DEFAULT TRUE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS confirmed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS prepared_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS served_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes_pt TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS notes_en TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_notes TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS estimated_prep_time INTEGER;

-- Migrate orders data
UPDATE orders SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;
UPDATE orders SET order_number = 'ORD-' || LPAD(id::text, 8, '0') WHERE order_number IS NULL;
UPDATE orders SET waiter_id = staff_id WHERE waiter_id IS NULL;
UPDATE orders SET subtotal = total_amount WHERE subtotal = 0;
UPDATE orders SET notes_pt = notes WHERE notes_pt IS NULL;

-- Enhance order_items table
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS cost_price_at_time NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS selling_price_at_time NUMERIC(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS special_instructions_pt TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS special_instructions_en TEXT;
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS subtotal NUMERIC(10, 2);
ALTER TABLE order_items ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending';

-- Migrate order_items data
UPDATE order_items SET selling_price_at_time = unit_price WHERE selling_price_at_time IS NULL;
UPDATE order_items SET subtotal = quantity * unit_price WHERE subtotal IS NULL;

-- Add tenant_id to discounts
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE discounts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE discounts SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to vouchers
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE vouchers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE vouchers SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to wallets
ALTER TABLE wallets ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
UPDATE wallets SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to transactions
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE transactions ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE transactions SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Migrate tables to restaurant_tables
INSERT INTO restaurant_tables (id, tenant_id, number, qr_code_url, status, capacity, location_zone, is_active, created_at, updated_at)
SELECT 
    t.id,
    '00000000-0000-0000-0000-000000000001'::uuid,
    t.table_number::text,
    t.qr_code,
    t.status,
    4,  -- Default capacity
    'main',  -- Default zone
    TRUE,
    t.created_at,
    t.updated_at
FROM tables t
ON CONFLICT (id) DO NOTHING;

-- Update table_assignments with tenant_id
ALTER TABLE table_assignments ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE table_assignments ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE table_assignments SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- Add tenant_id to audit_log
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS ip_address TEXT;
ALTER TABLE audit_log ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;
UPDATE audit_log SET tenant_id = '00000000-0000-0000-0000-000000000001'::uuid WHERE tenant_id IS NULL;

-- ========================
-- STEP 6: CREATE INDEXES FOR PERFORMANCE
-- ========================

CREATE INDEX IF NOT EXISTS idx_tenant_id ON tenants(id);
CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_phone ON employees(phone);
CREATE INDEX IF NOT EXISTS idx_categories_tenant ON categories(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_category_available ON menu_items(tenant_id, category_id, is_available);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_table ON orders(tenant_id, table_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_tenant_order ON payments(tenant_id, order_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_tenant_status ON vouchers(tenant_id, status);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item ON inventory_logs(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
CREATE INDEX IF NOT EXISTS idx_restaurant_tables_tenant ON restaurant_tables(tenant_id);

-- ========================
-- STEP 7: CREATE TRIGGERS
-- ========================

-- Auto-update updated_at timestamp function
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to new tables
CREATE TRIGGER trigger_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_tenant_settings_updated BEFORE UPDATE ON tenant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_subscriptions_updated BEFORE UPDATE ON subscriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_categories_updated BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_suppliers_updated BEFORE UPDATE ON suppliers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_allergens_updated BEFORE UPDATE ON allergens FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_inventory_items_updated BEFORE UPDATE ON inventory_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_menu_items_updated BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_item_components_updated BEFORE UPDATE ON item_components FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_stock_adjustments_updated BEFORE UPDATE ON stock_adjustments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_production_batches_updated BEFORE UPDATE ON production_batches FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_inventory_counts_updated BEFORE UPDATE ON inventory_counts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_inventory_count_items_updated BEFORE UPDATE ON inventory_count_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_low_stock_alerts_updated BEFORE UPDATE ON low_stock_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_purchase_orders_updated BEFORE UPDATE ON purchase_orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_restaurant_tables_updated BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_table_assignments_updated BEFORE UPDATE ON table_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_table_reservations_updated BEFORE UPDATE ON table_reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_order_items_updated BEFORE UPDATE ON order_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_discounts_updated BEFORE UPDATE ON discounts FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_payments_updated BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_vouchers_updated BEFORE UPDATE ON vouchers FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_wallets_updated BEFORE UPDATE ON wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_transactions_updated BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_audit_log_updated BEFORE UPDATE ON audit_log FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_inventory_logs_updated BEFORE UPDATE ON inventory_logs FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_shifts_updated BEFORE UPDATE ON shifts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger for stock deduction on order confirmation
CREATE OR REPLACE FUNCTION deduct_stock_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
        -- Deduct from inventory_items via menu_items
        UPDATE inventory_items ii
        SET current_stock = ii.current_stock - oi.quantity
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = NEW.id 
          AND mi.inventory_item_id = ii.id 
          AND mi.track_stock = TRUE
          AND ii.current_stock >= oi.quantity;
        
        -- Log the inventory change
        INSERT INTO inventory_logs (tenant_id, inventory_item_id, change_type, change_amount, previous_stock, new_stock, reference_id, reference_type, employee_id)
        SELECT 
            NEW.tenant_id,
            mi.inventory_item_id,
            'sale',
            -oi.quantity,
            ii.current_stock + oi.quantity,
            ii.current_stock,
            NEW.id,
            'order',
            NEW.waiter_id
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        JOIN inventory_items ii ON mi.inventory_item_id = ii.id
        WHERE oi.order_id = NEW.id AND mi.track_stock = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_orders_stock_deduction ON orders;
CREATE TRIGGER trigger_orders_stock_deduction AFTER INSERT OR UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_confirm();

-- ========================
-- STEP 8: ENABLE ROW LEVEL SECURITY
-- ========================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_item_allergens ENABLE ROW LEVEL SECURITY;

-- Sample RLS Policies
CREATE POLICY "Public can view active tenants" ON tenants FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view active categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view available menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view active tables" ON restaurant_tables FOR SELECT USING (is_active = true);
CREATE POLICY "Employees can view own tenant data" ON employees FOR SELECT USING (true);

-- ========================
-- MIGRATION COMPLETE
-- ========================
