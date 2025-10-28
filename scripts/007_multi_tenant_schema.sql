-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

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

-- Insert default tenant for The Spot
INSERT INTO tenants (name, domain, province, city, address, phone, email)
VALUES ('The Spot', 'thespot.mz', 'Maputo', 'Maputo', 'Av. Julius Nyerere', '+258843992929', 'info@thespot.mz')
ON CONFLICT (domain) DO NOTHING;

-- Insert default tenant settings
INSERT INTO tenant_settings (tenant_id)
SELECT id FROM tenants WHERE domain = 'thespot.mz'
ON CONFLICT (tenant_id) DO NOTHING;

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

-- Insert default roles for The Spot
INSERT INTO roles (tenant_id, name_pt, name_en, color, can_manage_orders, can_manage_tables, can_manage_menu, can_manage_inventory, can_manage_staff, can_view_reports, can_manage_settings, access_level)
SELECT 
    t.id,
    'Administrador',
    'Administrator',
    '#EF4444',
    TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, TRUE, 5
FROM tenants t WHERE t.domain = 'thespot.mz'
ON CONFLICT (tenant_id, name_pt) DO NOTHING;

INSERT INTO roles (tenant_id, name_pt, name_en, color, can_manage_orders, can_manage_tables, can_manage_menu, access_level)
SELECT 
    t.id,
    'Garçom',
    'Waiter',
    '#3B82F6',
    TRUE, TRUE, FALSE, 2
FROM tenants t WHERE t.domain = 'thespot.mz'
ON CONFLICT (tenant_id, name_pt) DO NOTHING;

INSERT INTO roles (tenant_id, name_pt, name_en, color, can_manage_orders, access_level)
SELECT 
    t.id,
    'Barman',
    'Bartender',
    '#8B5CF6',
    TRUE, 2
FROM tenants t WHERE t.domain = 'thespot.mz'
ON CONFLICT (tenant_id, name_pt) DO NOTHING;

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

-- ========================
-- UPDATE EXISTING TABLES
-- ========================

-- Add tenant_id to existing tables
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE restaurant_tables ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE;

-- Add bilingual fields to menu_items
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_pt TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS name_en TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_pt TEXT;
ALTER TABLE menu_items ADD COLUMN IF NOT EXISTS description_en TEXT;

-- Migrate existing data to default tenant
UPDATE menu_items SET tenant_id = (SELECT id FROM tenants WHERE domain = 'thespot.mz' LIMIT 1) WHERE tenant_id IS NULL;
UPDATE restaurant_tables SET tenant_id = (SELECT id FROM tenants WHERE domain = 'thespot.mz' LIMIT 1) WHERE tenant_id IS NULL;
UPDATE orders SET tenant_id = (SELECT id FROM tenants WHERE domain = 'thespot.mz' LIMIT 1) WHERE tenant_id IS NULL;

-- Copy existing names to bilingual fields
UPDATE menu_items SET name_pt = name, name_en = name WHERE name_pt IS NULL;
UPDATE menu_items SET description_pt = description, description_en = description WHERE description_pt IS NULL;

-- ========================
-- INDEXES FOR PERFORMANCE
-- ========================

CREATE INDEX IF NOT EXISTS idx_roles_tenant ON roles(tenant_id);
CREATE INDEX IF NOT EXISTS idx_employees_tenant ON employees(tenant_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_tenant_new ON menu_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_orders_tenant_new ON orders(tenant_id);
CREATE INDEX IF NOT EXISTS idx_tables_tenant_new ON restaurant_tables(tenant_id);

-- ========================
-- TRIGGERS
-- ========================

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

DROP TRIGGER IF EXISTS trigger_roles_updated ON roles;
CREATE TRIGGER trigger_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
