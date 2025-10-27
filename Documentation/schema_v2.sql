-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- For PIN encryption

-- ========================
-- CORE MULTI-TENANCY TABLES
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
    is_active BOOLEAN DEFAULT TRUE,
    subscription_tier TEXT DEFAULT 'basic' CHECK (subscription_tier IN ('basic', 'pro', 'enterprise')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tenant Settings Table
CREATE TABLE IF NOT EXISTS tenant_settings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    -- Localization
    languages TEXT[] DEFAULT '{"pt", "en"}',
    default_language TEXT DEFAULT 'pt',
    date_format TEXT DEFAULT 'DD/MM/YYYY',
    time_format TEXT DEFAULT '24h',
    -- Business Hours
    opening_time TIME DEFAULT '07:00',
    closing_time TIME DEFAULT '22:00',
    -- Tax Configuration (IVA in Mozambique)
    tax_enabled BOOLEAN DEFAULT TRUE,
    tax_rate NUMERIC(5,2) DEFAULT 17.00, -- Standard VAT rate in Mozambique
    tax_name TEXT DEFAULT 'IVA',
    -- Receipt Settings
    receipt_header_pt TEXT,
    receipt_header_en TEXT,
    receipt_footer_pt TEXT,
    receipt_footer_en TEXT,
    receipt_show_tax BOOLEAN DEFAULT TRUE,
    -- Table Management
    auto_table_status BOOLEAN DEFAULT TRUE,
    table_timeout_minutes INTEGER DEFAULT 120,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- STAFF MANAGEMENT
-- ========================

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    color TEXT DEFAULT '#6B7280',
    -- Permission flags
    can_manage_orders BOOLEAN DEFAULT FALSE,
    can_manage_tables BOOLEAN DEFAULT FALSE,
    can_manage_menu BOOLEAN DEFAULT FALSE,
    can_manage_inventory BOOLEAN DEFAULT FALSE,
    can_manage_staff BOOLEAN DEFAULT FALSE,
    can_view_reports BOOLEAN DEFAULT FALSE,
    can_manage_settings BOOLEAN DEFAULT FALSE,
    -- Access levels
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
    pin_hash TEXT, -- Hashed PIN for POS access
    language_preference TEXT DEFAULT 'pt' CHECK (language_preference IN ('pt', 'en')),
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, email),
    UNIQUE (tenant_id, phone)
);

-- ========================
-- MENU & INVENTORY MANAGEMENT
-- ========================

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

-- Menu Items Table
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name_pt TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_pt TEXT,
    description_en TEXT,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    size TEXT,
    -- Pricing
    cost_price NUMERIC(10, 2) NOT NULL CHECK (cost_price >= 0),
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
    show_discount BOOLEAN DEFAULT FALSE,
    -- Inventory
    track_stock BOOLEAN DEFAULT FALSE,
    stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    allow_out_of_stock_orders BOOLEAN DEFAULT FALSE,
    -- Availability
    is_available BOOLEAN DEFAULT TRUE,
    available_times TSTZRANGE DEFAULT '[,]'::tstzrange,
    -- Metadata
    image_url TEXT,
    preparation_time INTEGER, -- in minutes
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name_pt),
    UNIQUE (tenant_id, name_en)
);

-- ========================
-- TABLE MANAGEMENT
-- ========================

-- Restaurant Tables
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    number TEXT NOT NULL, -- Changed to TEXT for tables like "A1", "B2", etc.
    name_pt TEXT,
    name_en TEXT,
    status TEXT DEFAULT 'available' CHECK (status IN ('available', 'occupied', 'reserved', 'cleaning', 'maintenance')),
    capacity INTEGER NOT NULL CHECK (capacity > 0),
    min_capacity INTEGER DEFAULT 1 CHECK (min_capacity >= 1),
    max_capacity INTEGER CHECK (max_capacity >= min_capacity),
    location_zone TEXT, -- e.g., 'indoors', 'terrace', 'garden'
    position_x INTEGER,
    position_y INTEGER,
    shape TEXT DEFAULT 'rectangle' CHECK (shape IN ('rectangle', 'circle', 'square')),
    dimensions JSONB, -- For flexible table shapes
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
    notes TEXT,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- ORDER MANAGEMENT
-- ========================

-- Orders Table
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    order_number TEXT UNIQUE NOT NULL, -- Human-readable order number
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    customer_id UUID, -- For future customer management
    waiter_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    -- Order details
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'preparing', 'ready', 'served', 
        'completed', 'cancelled', 'refunded'
    )),
    type TEXT DEFAULT 'dine-in' CHECK (type IN ('dine-in', 'takeaway', 'delivery')),
    -- Pricing
    subtotal NUMERIC(10, 2) DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount NUMERIC(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(10, 2) DEFAULT 0 CHECK (total_amount >= 0),
    -- Timestamps
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    prepared_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    -- Metadata
    notes_pt TEXT,
    notes_en TEXT,
    customer_notes TEXT,
    estimated_prep_time INTEGER, -- in minutes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    -- Price snapshots
    cost_price_at_time NUMERIC(10, 2) NOT NULL,
    selling_price_at_time NUMERIC(10, 2) NOT NULL,
    -- Modifications
    special_instructions_pt TEXT,
    special_instructions_en TEXT,
    modifiers JSONB, -- For item customizations
    -- Calculated fields
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- PAYMENT & BILLING
-- ========================

-- Bills/Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    bill_number TEXT UNIQUE NOT NULL,
    -- Payment details
    payment_method TEXT NOT NULL CHECK (payment_method IN (
        'cash', 'card', 'mobile_money', 'bank_transfer', 'multicaixa'
    )),
    payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
    amount_paid NUMERIC(10, 2) NOT NULL CHECK (amount_paid >= 0),
    tip_amount NUMERIC(10, 2) DEFAULT 0 CHECK (tip_amount >= 0),
    change_amount NUMERIC(10, 2) DEFAULT 0 CHECK (change_amount >= 0),
    -- Reference numbers
    transaction_id TEXT, -- Bank/Mobile money transaction ID
    card_last_four TEXT,
    -- Metadata
    paid_at TIMESTAMP WITH TIME ZONE,
    cashier_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- INVENTORY & ANALYTICS
-- ========================

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
    reference_id UUID, -- Link to order, purchase, etc.
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
    -- Cash management
    opening_balance NUMERIC(10, 2) DEFAULT 0,
    closing_balance NUMERIC(10, 2),
    expected_cash NUMERIC(10, 2),
    actual_cash NUMERIC(10, 2),
    cash_difference NUMERIC(10, 2),
    -- Shift summary
    total_sales NUMERIC(10, 2) DEFAULT 0,
    total_orders INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'closed', 'pending_review')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, shift_number)
);

-- ========================
-- LOCALIZATION & TRANSLATIONS
-- ========================

-- Dynamic Translations Table
CREATE TABLE IF NOT EXISTS translations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    key TEXT NOT NULL, -- Translation key
    module TEXT NOT NULL, -- Module where translation is used
    text_pt TEXT NOT NULL,
    text_en TEXT NOT NULL,
    description TEXT, -- Context for translators
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, key, module)
);

-- ========================
-- INDEXES FOR PERFORMANCE
-- ========================

-- Tenant-based indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_menu_items_tenant ON menu_items(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_tenant ON orders(tenant_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_tables_tenant ON restaurant_tables(tenant_id);

-- Order performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_table ON orders(table_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_orders_created ON orders(created_at);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_order_items_order ON order_items(order_id);

-- Inventory indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_item ON inventory_logs(menu_item_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_inventory_logs_created ON inventory_logs(created_at);

-- Shift indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_shifts_date ON shifts(start_time);

-- ========================
-- TRIGGERS & FUNCTIONS
-- ========================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all main tables
CREATE TRIGGER trigger_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_menu_items_updated BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Order number generation
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
DECLARE
    tenant_code TEXT;
    order_seq BIGINT;
    new_order_number TEXT;
BEGIN
    -- Get tenant code (first 3 letters of name)
    SELECT UPPER(SUBSTRING(name FROM 1 FOR 3)) INTO tenant_code 
    FROM tenants WHERE id = NEW.tenant_id;
    
    -- Get next sequence for this tenant
    order_seq := nextval('order_number_seq_' || REPLACE(NEW.tenant_id::text, '-', '_'));
    
    -- Format: TENANT-YEAR-MONTH-SEQUENCE
    new_order_number := tenant_code || '-' || 
                       TO_CHAR(NEW.created_at, 'YYMM') || '-' || 
                       LPAD(order_seq::text, 4, '0');
    
    NEW.order_number := new_order_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_order_number BEFORE INSERT ON orders FOR EACH ROW EXECUTE FUNCTION generate_order_number();

-- Stock update trigger
CREATE OR REPLACE FUNCTION update_menu_item_stock()
RETINS TRIGGER AS $$
BEGIN
    -- Update stock count when inventory logs are added
    UPDATE menu_items 
    SET stock_count = NEW.new_stock,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.menu_item_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock AFTER INSERT ON inventory_logs FOR EACH ROW EXECUTE FUNCTION update_menu_item_stock();

-- ========================
-- VIEWS FOR REPORTING
-- ========================

-- Daily Sales View
CREATE VIEW daily_sales_summary AS
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

-- Inventory Alert View
CREATE VIEW low_stock_alerts AS
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

-- Employee Performance View
CREATE VIEW employee_performance AS
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
-- ROW LEVEL SECURITY (Optional for Supabase)
-- ========================

-- Note: These policies would be enabled in Supabase for security
/*
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Policy examples (to be customized based on auth system)
CREATE POLICY "Tenant isolation" ON tenants FOR ALL USING (id = current_setting('app.current_tenant_id'));
CREATE POLICY "Employee tenant access" ON employees FOR ALL USING (tenant_id = current_setting('app.current_tenant_id'));
*/