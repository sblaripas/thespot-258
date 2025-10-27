-- Enable UUID extension (Supabase has this by default, but included for completeness)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles Table (from Access Rights)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    color TEXT,
    pos_access BOOLEAN DEFAULT FALSE,
    pos_permissions TEXT[] DEFAULT '{}',
    backoffice_access BOOLEAN DEFAULT FALSE,
    backoffice_permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Employees Table (from Employee Management)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    pin TEXT,  -- Should be hashed in production (e.g., using pgcrypto)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table (from Inventory Management)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table (from Inventory and Order System)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    size TEXT,
    price NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2),
    stock_count INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    available BOOLEAN DEFAULT TRUE,
    in_stock BOOLEAN GENERATED ALWAYS AS (stock_count > 0) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Restaurant Tables (from Order System)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    number INTEGER UNIQUE NOT NULL,
    status TEXT DEFAULT 'free',  -- e.g., free, occupied, reserved
    capacity INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table (from Order System)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id TEXT NOT NULL,  -- Device-based anonymous client ID
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',  -- pending, confirmed, preparing, ready, delivered, cancelled, rejected
    total NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table (from Order System)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * price_at_time) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bills Table (from Order System, assuming per table)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs Table (for auditing stock changes, integrated with Inventory Management)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    reason TEXT,  -- e.g., sale, purchase, waste, adjustment
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update stock count on inventory log insert
CREATE OR REPLACE FUNCTION update_stock_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE menu_items
    SET stock_count = stock_count + NEW.change_amount,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = NEW.menu_item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER INSERT ON inventory_logs
FOR EACH ROW
EXECUTE FUNCTION update_stock_count();

-- Example View for Analytics (from Order System)
CREATE VIEW daily_analytics AS
SELECT 
    DATE(created_at) AS date,
    COUNT(*) AS order_count,
    SUM(total) AS total_revenue
FROM orders
WHERE status = 'delivered'
GROUP BY DATE(created_at);

-- Enable UUID extension (Supabase has this by default, but included for completeness)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tenants Table (for multi-tenancy)
CREATE TABLE IF NOT EXISTS tenants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    domain TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Roles Table (from Access Rights, per tenant)
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    color TEXT,
    pos_access BOOLEAN DEFAULT FALSE,
    pos_permissions TEXT[] DEFAULT '{}',
    backoffice_access BOOLEAN DEFAULT FALSE,
    backoffice_permissions TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

-- Employees Table (from Employee Management, per tenant)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE,
    phone TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    pin TEXT,  -- Should be hashed in production (e.g., using pgcrypto)
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Categories Table (from Inventory Management, per tenant)
CREATE TABLE IF NOT EXISTS categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

-- Menu Items Table (from Inventory and Order System, per tenant)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    description TEXT,
    size TEXT,
    price NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(10, 2),
    discount_price NUMERIC(10, 2),
    show_discount_on_menu BOOLEAN DEFAULT FALSE,
    stock_count INTEGER DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 10,
    available BOOLEAN DEFAULT TRUE,
    in_stock BOOLEAN GENERATED ALWAYS AS (stock_count > 0) STORED,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name)
);

-- Restaurant Tables (from Order System, per tenant)
CREATE TABLE IF NOT EXISTS restaurant_tables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    number INTEGER NOT NULL,
    status TEXT DEFAULT 'free',  -- e.g., free, occupied, reserved
    capacity INTEGER DEFAULT 4,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, number)
);

-- Orders Table (from Order System, per tenant)
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    client_id TEXT NOT NULL,  -- Device-based anonymous client ID
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    waiter_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',  -- pending, confirmed, preparing, ready, delivered, cancelled, rejected
    total NUMERIC(10, 2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table (from Order System)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price_at_time NUMERIC(10, 2) NOT NULL,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * price_at_time) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Bills Table (from Order System, assuming per table, per tenant)
CREATE TABLE IF NOT EXISTS bills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE,
    total NUMERIC(10, 2) NOT NULL,
    paid BOOLEAN DEFAULT FALSE,
    payment_method TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs Table (for auditing stock changes, integrated with Inventory Management, per tenant)
CREATE TABLE IF NOT EXISTS inventory_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    change_amount INTEGER NOT NULL,
    reason TEXT,  -- e.g., sale, purchase, waste, adjustment
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Sales Records Table (from Sales Reports System, per tenant)
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    date TIMESTAMP WITH TIME ZONE NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    item_id UUID REFERENCES menu_items(id) ON DELETE SET NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL,
    unit_cost NUMERIC(10, 2) NOT NULL,
    gross_amount NUMERIC(10, 2) NOT NULL,
    discount INTEGER DEFAULT 0,
    discount_amount NUMERIC(10, 2) DEFAULT 0,
    refund BOOLEAN DEFAULT FALSE,
    refund_amount NUMERIC(10, 2) DEFAULT 0,
    net_amount NUMERIC(10, 2) NOT NULL,
    cost_amount NUMERIC(10, 2) NOT NULL,
    profit NUMERIC(10, 2) NOT NULL,
    payment_type TEXT NOT NULL CHECK (payment_type IN ('Cash', 'Card', 'Mobile Payment')),
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Receipts Table (from Receipts Component, per tenant)
CREATE TABLE IF NOT EXISTS receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    receipt_no TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    time TIME NOT NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    customer_name TEXT,
    type TEXT NOT NULL CHECK (type IN ('Sale', 'Refund')),
    subtotal NUMERIC(10, 2) NOT NULL,
    tax NUMERIC(10, 2) NOT NULL,
    total NUMERIC(10, 2) NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('Cash', 'Card', 'Mobile Payment')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Items Table
CREATE TABLE IF NOT EXISTS receipt_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    receipt_id UUID REFERENCES receipts(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Shifts Table (from Shifts Management, per tenant)
CREATE TABLE IF NOT EXISTS shifts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    pos TEXT NOT NULL,
    opening_time TIME NOT NULL,
    closing_time TIME NOT NULL,
    expected_cash NUMERIC(10, 2) NOT NULL,
    actual_cash NUMERIC(10, 2) NOT NULL,
    difference NUMERIC(10, 2) GENERATED ALWAYS AS (actual_cash - expected_cash) STORED,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    status TEXT DEFAULT 'closed',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Receipt Settings Table (from Receipt Settings, per tenant)
CREATE TABLE IF NOT EXISTS receipt_settings (
    tenant_id UUID PRIMARY KEY REFERENCES tenants(id) ON DELETE CASCADE,
    emailed_receipt_enabled BOOLEAN DEFAULT TRUE,
    emailed_receipt_logo TEXT,
    printed_receipt_enabled BOOLEAN DEFAULT TRUE,
    printed_receipt_logo TEXT,
    loop_receipts BOOLEAN DEFAULT FALSE,
    header TEXT,
    footer TEXT,
    show_customer_info BOOLEAN DEFAULT FALSE,
    show_comments BOOLEAN DEFAULT FALSE,
    language TEXT DEFAULT 'English',
    store_name TEXT,
    store_address TEXT,
    store_phone TEXT,
    store_email TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger function to update stock count on inventory log insert
CREATE OR REPLACE FUNCTION update_stock_count()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE menu_items
    SET stock_count = stock_count + NEW.change_amount,
        last_updated = CURRENT_TIMESTAMP
    WHERE id = NEW.menu_item_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_stock
AFTER INSERT ON inventory_logs
FOR EACH ROW
EXECUTE FUNCTION update_stock_count();

-- Example View for Analytics (from Order System, can be filtered by tenant in queries)
CREATE VIEW daily_analytics AS
SELECT 
    tenant_id,
    DATE(created_at) AS date,
    COUNT(*) AS order_count,
    SUM(total) AS total_revenue
FROM orders
WHERE status = 'delivered'
GROUP BY tenant_id, DATE(created_at);