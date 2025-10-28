-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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
    cost_price NUMERIC(10, 2) NOT NULL CHECK (cost_price >= 0),
    selling_price NUMERIC(10, 2) NOT NULL CHECK (selling_price >= 0),
    discount_price NUMERIC(10, 2) CHECK (discount_price >= 0),
    show_discount BOOLEAN DEFAULT FALSE,
    track_stock BOOLEAN DEFAULT FALSE,
    stock_count INTEGER DEFAULT 0 CHECK (stock_count >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    allow_out_of_stock_orders BOOLEAN DEFAULT FALSE,
    is_available BOOLEAN DEFAULT TRUE,
    image_url TEXT,
    preparation_time INTEGER,
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
    number TEXT NOT NULL,
    name_pt TEXT,
    name_en TEXT,
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
    order_number TEXT UNIQUE NOT NULL,
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE SET NULL,
    customer_id UUID,
    waiter_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'preparing', 'ready', 'served', 
        'completed', 'cancelled', 'refunded'
    )),
    type TEXT DEFAULT 'dine-in' CHECK (type IN ('dine-in', 'takeaway', 'delivery')),
    subtotal NUMERIC(10, 2) DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount NUMERIC(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(10, 2) DEFAULT 0 CHECK (total_amount >= 0),
    placed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    confirmed_at TIMESTAMP WITH TIME ZONE,
    prepared_at TIMESTAMP WITH TIME ZONE,
    served_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    notes_pt TEXT,
    notes_en TEXT,
    customer_notes TEXT,
    estimated_prep_time INTEGER,
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
    cost_price_at_time NUMERIC(10, 2) NOT NULL,
    selling_price_at_time NUMERIC(10, 2) NOT NULL,
    special_instructions_pt TEXT,
    special_instructions_en TEXT,
    subtotal NUMERIC(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'preparing', 'ready', 'served', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- PAYMENT & BILLING
-- ========================

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

-- ========================
-- INVENTORY & SHIFTS
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

-- Apply updated_at trigger to tables
CREATE TRIGGER trigger_tenants_updated BEFORE UPDATE ON tenants FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_employees_updated BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_menu_items_updated BEFORE UPDATE ON menu_items FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_orders_updated BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_roles_updated BEFORE UPDATE ON roles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER trigger_restaurant_tables_updated BEFORE UPDATE ON restaurant_tables FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ========================
-- INDEXES FOR PERFORMANCE
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
CREATE INDEX IF NOT EXISTS idx_shifts_employee ON shifts(employee_id);

-- ========================
-- ENABLE ROW LEVEL SECURITY
-- ========================

ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Create public read policies for menu browsing
CREATE POLICY "Public can view tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view tables" ON restaurant_tables FOR SELECT USING (is_active = true);

-- ========================
-- SEED DATA
-- ========================

-- Insert sample tenant
INSERT INTO tenants (id, name, legal_name, domain, province, city, address, phone, email)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Restaurante Mar Azul',
    'Mar Azul Restaurantes Lda',
    'marazul',
    'Maputo',
    'Maputo',
    'Av. Julius Nyerere 123, Maputo',
    '+258 84 123 4567',
    'contato@marazul.co.mz'
);

-- Insert tenant settings
INSERT INTO tenant_settings (tenant_id, receipt_header_pt, receipt_header_en, receipt_footer_pt, receipt_footer_en)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Restaurante Mar Azul - Maputo\nAv. Julius Nyerere 123\nTel: +258 84 123 4567',
    'Mar Azul Restaurant - Maputo\nAv. Julius Nyerere 123\nTel: +258 84 123 4567',
    'Obrigado pela sua visita!\nVolte sempre!',
    'Thank you for your visit!\nCome back soon!'
);

-- Insert roles
INSERT INTO roles (id, tenant_id, name_pt, name_en, color, can_manage_orders, can_manage_tables, can_manage_menu, can_manage_inventory, can_manage_staff, can_view_reports, can_manage_settings, access_level)
VALUES
    ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Gerente', 'Manager', '#EF4444', true, true, true, true, true, true, true, 5),
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Garçom', 'Waiter', '#3B82F6', true, true, false, false, false, false, false, 2),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Cozinheiro', 'Chef', '#10B981', true, false, false, true, false, false, false, 3),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Caixa', 'Cashier', '#F59E0B', false, false, false, false, false, false, false, 1);

-- Insert employees
INSERT INTO employees (id, tenant_id, name, email, phone, role_id, pin_hash, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'João Silva', 'joao.silva@marazul.co.mz', '+258 84 111 1111', '00000000-0000-0000-0000-000000000010', 'hashed_pin_1234', true),
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Maria Santos', 'maria.santos@marazul.co.mz', '+258 84 222 2222', '00000000-0000-0000-0000-000000000011', 'hashed_pin_2345', true),
    ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Pedro Costa', 'pedro.costa@marazul.co.mz', '+258 84 333 3333', '00000000-0000-0000-0000-000000000011', 'hashed_pin_3456', true),
    ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Ana Fernandes', 'ana.fernandes@marazul.co.mz', '+258 84 444 4444', '00000000-0000-0000-0000-000000000012', 'hashed_pin_4567', true),
    ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Carlos Moiane', 'carlos.moiane@marazul.co.mz', '+258 84 555 5555', '00000000-0000-0000-0000-000000000013', 'hashed_pin_5678', true);

-- Insert categories
INSERT INTO categories (id, tenant_id, name_pt, name_en, description_pt, description_en, display_order, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Entradas', 'Starters', 'Para começar a refeição', 'To start your meal', 1, true),
    ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Pratos Principais', 'Main Courses', 'Pratos principais', 'Main dishes', 2, true),
    ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', 'Sobremesas', 'Desserts', 'Para finalizar', 'To finish', 3, true),
    ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000001', 'Bebidas', 'Drinks', 'Bebidas refrescantes', 'Refreshing drinks', 4, true);

-- Insert menu items
INSERT INTO menu_items (id, tenant_id, name_pt, name_en, description_pt, description_en, category_id, cost_price, selling_price, is_available, image_url, preparation_time)
VALUES
    -- Entradas
    ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', 'Camarão Grelhado', 'Grilled Prawns', 'Camarão fresco grelhado com limão e alho', 'Fresh prawns grilled with lemon and garlic', '00000000-0000-0000-0000-000000000030', 180, 450, true, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 15),
    ('00000000-0000-0000-0000-000000000041', '00000000-0000-0000-0000-000000000001', 'Peixinhos da Horta', 'Green Bean Tempura', 'Feijão verde frito em massa', 'Green beans fried in batter', '00000000-0000-0000-0000-000000000030', 80, 180, true, 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?w=400', 10),
    ('00000000-0000-0000-0000-000000000042', '00000000-0000-0000-0000-000000000001', 'Samosas de Carne', 'Meat Samosas', 'Pastéis fritos recheados com carne', 'Fried pastries filled with meat', '00000000-0000-0000-0000-000000000030', 60, 150, true, 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400', 12),
    
    -- Pratos Principais
    ('00000000-0000-0000-0000-000000000043', '00000000-0000-0000-0000-000000000001', 'Frango Piri-Piri', 'Piri-Piri Chicken', 'Frango grelhado com molho piri-piri picante', 'Grilled chicken with spicy piri-piri sauce', '00000000-0000-0000-0000-000000000031', 150, 380, true, 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400', 25),
    ('00000000-0000-0000-0000-000000000044', '00000000-0000-0000-0000-000000000001', 'Matapa', 'Matapa', 'Prato tradicional moçambicano com folhas de mandioca', 'Traditional Mozambican dish with cassava leaves', '00000000-0000-0000-0000-000000000031', 120, 320, true, 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400', 30),
    ('00000000-0000-0000-0000-000000000045', '00000000-0000-0000-0000-000000000001', 'Peixe Grelhado', 'Grilled Fish', 'Peixe fresco do dia grelhado', 'Fresh fish of the day grilled', '00000000-0000-0000-0000-000000000031', 200, 520, true, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400', 20),
    ('00000000-0000-0000-0000-000000000046', '00000000-0000-0000-0000-000000000001', 'Bife com Batatas', 'Steak with Fries', 'Bife de vaca com batatas fritas', 'Beef steak with french fries', '00000000-0000-0000-0000-000000000031', 180, 480, true, 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400', 20),
    
    -- Sobremesas
    ('00000000-0000-0000-0000-000000000047', '00000000-0000-0000-0000-000000000001', 'Pudim de Coco', 'Coconut Pudding', 'Pudim cremoso de coco fresco', 'Creamy fresh coconut pudding', '00000000-0000-0000-0000-000000000032', 50, 150, true, 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400', 5),
    ('00000000-0000-0000-0000-000000000048', '00000000-0000-0000-0000-000000000001', 'Bolo de Ananás', 'Pineapple Cake', 'Bolo caseiro de ananás', 'Homemade pineapple cake', '00000000-0000-0000-0000-000000000032', 60, 120, true, 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=400', 5),
    
    -- Bebidas
    ('00000000-0000-0000-0000-000000000049', '00000000-0000-0000-0000-000000000001', 'Coca-Cola', 'Coca-Cola', 'Refrigerante 330ml', 'Soft drink 330ml', '00000000-0000-0000-0000-000000000033', 20, 60, true, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400', 1),
    ('00000000-0000-0000-0000-000000000050', '00000000-0000-0000-0000-000000000001', 'Sumo Natural de Maracujá', 'Fresh Passion Fruit Juice', 'Sumo natural de maracujá', 'Natural passion fruit juice', '00000000-0000-0000-0000-000000000033', 30, 80, true, 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400', 3),
    ('00000000-0000-0000-0000-000000000051', '00000000-0000-0000-0000-000000000001', 'Cerveja 2M', '2M Beer', 'Cerveja moçambicana 330ml', 'Mozambican beer 330ml', '00000000-0000-0000-0000-000000000033', 35, 100, true, 'https://images.unsplash.com/photo-1535958636474-b021ee887b13?w=400', 1);

-- Insert restaurant tables
INSERT INTO restaurant_tables (id, tenant_id, number, status, capacity, location_zone, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000001', '1', 'occupied', 4, 'indoors', true),
    ('00000000-0000-0000-0000-000000000061', '00000000-0000-0000-0000-000000000001', '2', 'available', 2, 'indoors', true),
    ('00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000001', '3', 'occupied', 6, 'indoors', true),
    ('00000000-0000-0000-0000-000000000063', '00000000-0000-0000-0000-000000000001', '4', 'reserved', 4, 'indoors', true),
    ('00000000-0000-0000-0000-000000000064', '00000000-0000-0000-0000-000000000001', '5', 'available', 2, 'terrace', true),
    ('00000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000001', '6', 'occupied', 4, 'terrace', true),
    ('00000000-0000-0000-0000-000000000066', '00000000-0000-0000-0000-000000000001', '7', 'cleaning', 8, 'terrace', true),
    ('00000000-0000-0000-0000-000000000067', '00000000-0000-0000-0000-000000000001', '8', 'available', 4, 'terrace', true),
    ('00000000-0000-0000-0000-000000000068', '00000000-0000-0000-0000-000000000001', '9', 'available', 2, 'garden', true),
    ('00000000-0000-0000-0000-000000000069', '00000000-0000-0000-0000-000000000001', '10', 'available', 6, 'garden', true);

-- Insert sample orders
INSERT INTO orders (id, tenant_id, order_number, table_id, waiter_id, status, subtotal, tax_amount, total_amount, placed_at)
VALUES
    ('00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000001', 'MAR-2501-0001', '00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000021', 'preparing', 850, 144.50, 994.50, NOW() - INTERVAL '10 minutes'),
    ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000001', 'MAR-2501-0002', '00000000-0000-0000-0000-000000000062', '00000000-0000-0000-0000-000000000022', 'ready', 1240, 210.80, 1450.80, NOW() - INTERVAL '5 minutes'),
    ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000001', 'MAR-2501-0003', '00000000-0000-0000-0000-000000000065', '00000000-0000-0000-0000-000000000021', 'pending', 420, 71.40, 491.40, NOW() - INTERVAL '2 minutes');

-- Insert order items for first order
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, cost_price_at_time, selling_price_at_time, status)
VALUES
    ('00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000040', 2, 450, 180, 450, 'preparing'),
    ('00000000-0000-0000-0000-000000000070', '00000000-0000-0000-0000-000000000049', 1, 60, 20, 60, 'ready');

-- Insert order items for second order
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, cost_price_at_time, selling_price_at_time, status)
VALUES
    ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000043', 2, 380, 150, 380, 'ready'),
    ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000044', 1, 320, 120, 320, 'ready'),
    ('00000000-0000-0000-0000-000000000071', '00000000-0000-0000-0000-000000000050', 2, 80, 30, 80, 'ready');

-- Insert order items for third order
INSERT INTO order_items (order_id, menu_item_id, quantity, unit_price, cost_price_at_time, selling_price_at_time, status)
VALUES
    ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000041', 2, 180, 80, 180, 'pending'),
    ('00000000-0000-0000-0000-000000000072', '00000000-0000-0000-0000-000000000049', 1, 60, 20, 60, 'pending');

-- Insert a shift
INSERT INTO shifts (id, tenant_id, shift_number, employee_id, start_time, opening_balance, status)
VALUES
    ('00000000-0000-0000-0000-000000000080', '00000000-0000-0000-0000-000000000001', 'SH-2025-01-27-001', '00000000-0000-0000-0000-000000000024', NOW() - INTERVAL '3 hours', 5000, 'open');

-- Insert table reservation
INSERT INTO table_reservations (tenant_id, table_id, customer_name, customer_phone, party_size, reservation_time, status, created_by)
VALUES
    ('00000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000063', 'Fernando Macamo', '+258 84 999 9999', 4, NOW() + INTERVAL '2 hours', 'confirmed', '00000000-0000-0000-0000-000000000021');