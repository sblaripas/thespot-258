-- WARNING: This is the final schema incorporating all improvements for RestaurantOS.
-- It includes multi-tenancy, enhanced inventory, payments, QR events integration, and RLS.
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
    nuit TEXT,  -- Added for Mozambique compliance (número fiscal)
    licenca TEXT,  -- Added for operational license
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
    payment_methods_enabled TEXT[] DEFAULT '{"M-Pesa", "e-Mola", "wallet", "cash", "card"}',  -- Added for payment options
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

-- Subscriptions Table (New: For managing tiers)
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled')),
    features_enabled JSONB DEFAULT '{}',  -- e.g., {"advanced_reports": true}
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
    can_issue_vouchers BOOLEAN DEFAULT FALSE,  -- Added for QR events
    can_manage_qr_menus BOOLEAN DEFAULT FALSE,  -- Added for digital menus
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
    assigned_zones TEXT[],  -- Added: Array for table/area assignments in POS
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

-- Suppliers Table (New: For inventory purchases)
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

-- Allergens Table (New: For menu safety in digital menus)
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

-- Menu Items Allergen Junction (New: Many-to-many for allergens)
CREATE TABLE IF NOT EXISTS menu_item_allergens (
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE CASCADE,
    allergen_id UUID REFERENCES allergens(id) ON DELETE CASCADE,
    PRIMARY KEY (menu_item_id, allergen_id)
);

-- Inventory Items Table (Unified with menu for stock tracking)
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    unit TEXT NOT NULL DEFAULT 'unit',
    current_stock NUMERIC NOT NULL DEFAULT 0,
    min_stock_level NUMERIC NOT NULL DEFAULT 0,
    max_stock_level NUMERIC,
    unit_cost NUMERIC NOT NULL DEFAULT 0,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,  -- FK to suppliers
    barcode TEXT,
    sku TEXT,
    is_composite BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table (Linked to inventory)
CREATE TABLE IF NOT EXISTS menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE SET NULL,  -- Link to inventory
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
    event_eligible BOOLEAN DEFAULT FALSE,  -- Added: For QR event redeemables
    image_url TEXT,
    preparation_time INTEGER,
    variants JSONB DEFAULT '{}',  -- Added: For sizes/prices
    tags TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (tenant_id, name_pt),
    UNIQUE (tenant_id, name_en)
);

-- Item Components Table (For composites)
CREATE TABLE IF NOT EXISTS item_components (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    parent_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    component_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity_required NUMERIC NOT NULL,
    waste_factor NUMERIC DEFAULT 0,  -- Added: For production losses
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Stock Adjustments Table
CREATE TABLE IF NOT EXISTS stock_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    adjustment_type TEXT NOT NULL,
    quantity NUMERIC NOT NULL,
    previous_stock NUMERIC NOT NULL,
    new_stock NUMERIC NOT NULL,
    reason TEXT,
    notes TEXT,
    reference_id UUID,
    reference_type TEXT,
    adjusted_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    approved_by UUID REFERENCES employees(id) ON DELETE SET NULL,  -- Added: For approvals
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Production Batches Table
CREATE TABLE IF NOT EXISTS production_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    produced_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    quantity_produced NUMERIC NOT NULL,
    production_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    produced_by UUID REFERENCES employees(id) ON DELETE SET NULL NOT NULL,
    batch_number TEXT,
    expiry_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    cost_total NUMERIC DEFAULT 0,  -- Added: Calculated cost
    status TEXT DEFAULT 'completed' NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Counts Table
CREATE TABLE IF NOT EXISTS inventory_counts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    count_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    count_type TEXT DEFAULT 'full' NOT NULL,
    status TEXT DEFAULT 'in_progress' NOT NULL,
    counted_by UUID REFERENCES employees(id) ON DELETE SET NULL NOT NULL,
    location TEXT,  -- Added: e.g., 'bar' for POS
    notes TEXT,
    total_variance NUMERIC DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Count Items Table
CREATE TABLE IF NOT EXISTS inventory_count_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    count_id UUID REFERENCES inventory_counts(id) ON DELETE CASCADE NOT NULL,
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    expected_quantity NUMERIC NOT NULL,
    counted_quantity NUMERIC,
    variance NUMERIC,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Low Stock Alerts Table
CREATE TABLE IF NOT EXISTS low_stock_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    inventory_item_id UUID REFERENCES inventory_items(id) ON DELETE CASCADE NOT NULL,
    alert_level NUMERIC NOT NULL,
    current_stock NUMERIC NOT NULL,
    status TEXT DEFAULT 'active' NOT NULL,
    acknowledged_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    acknowledged_at TIMESTAMP WITH TIME ZONE,
    resolved_at TIMESTAMP WITH TIME ZONE,
    notification_method TEXT DEFAULT 'app',  -- Added: 'email', 'app'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Purchase Orders Table (New: For supplier management)
CREATE TABLE IF NOT EXISTS purchase_orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL NOT NULL,
    order_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expected_delivery DATE,
    items JSONB NOT NULL,  -- e.g., [{"item_id": uuid, "quantity": num}]
    total_cost NUMERIC DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'ordered', 'received', 'cancelled')),
    notes TEXT,
    created_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    qr_code_url TEXT,  -- Added: Generated QR URL for digital menus
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

-- Table Assignments
CREATE TABLE IF NOT EXISTS table_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    table_id UUID REFERENCES restaurant_tables(id) ON DELETE CASCADE NOT NULL,
    waiter_id UUID REFERENCES employees(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    confirmation_code TEXT,  -- Added: For SMS/email confirmations
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
    customer_id UUID,  -- For client app tracking
    waiter_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    qr_scan_id TEXT,  -- Added: For tracking digital menu QR origin
    status TEXT DEFAULT 'pending' CHECK (status IN (
        'pending', 'confirmed', 'preparing', 'ready', 'served',
        'completed', 'cancelled', 'refunded'
    )),
    type TEXT DEFAULT 'dine-in' CHECK (type IN ('dine-in', 'takeaway', 'delivery')),
    subtotal NUMERIC(10, 2) DEFAULT 0 CHECK (subtotal >= 0),
    tax_amount NUMERIC(10, 2) DEFAULT 0 CHECK (tax_amount >= 0),
    discount_amount NUMERIC(10, 2) DEFAULT 0 CHECK (discount_amount >= 0),
    total_amount NUMERIC(10, 2) DEFAULT 0 CHECK (total_amount >= 0),
    guest_count INTEGER DEFAULT 1,  -- Added: For table capacity checks
    payment_method TEXT,  -- Added: Link to payments
    tax_compliant BOOLEAN DEFAULT TRUE,  -- Added: For Mozambique IVA compliance
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
    menu_item_id UUID REFERENCES menu_items(id) ON DELETE RESTRICT NOT NULL,
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

-- Discounts Table
CREATE TABLE IF NOT EXISTS discounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
    discount_type TEXT NOT NULL,
    discount_value NUMERIC NOT NULL,
    discount_amount NUMERIC NOT NULL,
    discount_code TEXT,  -- Added: For promo codes in QR events
    reason TEXT,
    approved_by TEXT,
    applied_by TEXT NOT NULL,
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
        'cash', 'card', 'mobile_money', 'bank_transfer', 'multicaixa', 'wallet'  -- Added 'wallet' for QR events
    )),
    mobile_money_ref TEXT,  -- Added: For M-Pesa/e-Mola references
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,  -- Added: Link to QR vouchers
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
-- QR EVENTS & WALLETS
-- ========================
-- Vouchers Table
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    qr_code TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL DEFAULT 500,
    status TEXT DEFAULT 'active' NOT NULL CHECK (status IN ('active', 'voided', 'used')),
    issued_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    voided_at TIMESTAMP WITH TIME ZONE,
    client_phone TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Wallets Table
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL UNIQUE,
    balance INTEGER NOT NULL DEFAULT 0,
    client_phone TEXT,
    activated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Transactions Table (For wallet movements)
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    wallet_id UUID REFERENCES wallets(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'voucher_credit')),  -- Expanded
    amount INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- LOGS & AUDIT
-- ========================
-- Audit Log Table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE NOT NULL,  -- Added
    user_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    details JSONB,
    ip_address TEXT,  -- Added: For security
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inventory Logs Table
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
    reference_type TEXT,  -- Added: 'order', 'production', etc.
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ========================
-- SHIFTS MANAGEMENT
-- ========================
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
    total_tips NUMERIC(10, 2) DEFAULT 0,  -- Added
    total_discounts NUMERIC(10, 2) DEFAULT 0,  -- Added
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

-- Apply to all tables (expanded list)
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

-- Trigger for stock deduction on order confirmation (example for POS integration)
CREATE OR REPLACE FUNCTION deduct_stock_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'confirmed' AND OLD.status != 'confirmed' THEN
        UPDATE inventory_items ii
        SET current_stock = ii.current_stock - oi.quantity
        FROM order_items oi
        JOIN menu_items mi ON oi.menu_item_id = mi.id
        WHERE oi.order_id = NEW.id AND mi.inventory_item_id = ii.id AND mi.track_stock = TRUE;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_orders_stock_deduction AFTER UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION deduct_stock_on_confirm();

-- Similar triggers for production, adjustments, etc.

-- ========================
-- INDEXES FOR PERFORMANCE
-- ========================
CREATE INDEX idx_tenant_id ON tenants(id);
CREATE INDEX idx_roles_tenant ON roles(tenant_id);
CREATE INDEX idx_employees_tenant ON employees(tenant_id);
CREATE INDEX idx_categories_tenant ON categories(tenant_id);
CREATE INDEX idx_menu_items_tenant_category_available ON menu_items(tenant_id, category_id, is_available);  -- For digital menus
CREATE INDEX idx_inventory_items_tenant ON inventory_items(tenant_id);
CREATE INDEX idx_orders_tenant_status ON orders(tenant_id, status);
CREATE INDEX idx_orders_tenant_table ON orders(tenant_id, table_id);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_payments_tenant_order ON payments(tenant_id, order_id);
CREATE INDEX idx_vouchers_tenant_status ON vouchers(tenant_id, status);  -- For QR events
CREATE INDEX idx_inventory_logs_item ON inventory_logs(menu_item_id);
CREATE INDEX idx_shifts_employee ON shifts(employee_id);

-- ========================
-- ENABLE ROW LEVEL SECURITY
-- ========================
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE allergens ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;

-- Sample Policies (expand as needed)
CREATE POLICY "Public can view tenants" ON tenants FOR SELECT USING (true);
CREATE POLICY "Public can view categories" ON categories FOR SELECT USING (is_active = true);
CREATE POLICY "Public can view menu items" ON menu_items FOR SELECT USING (is_available = true);
CREATE POLICY "Public can view tables" ON restaurant_tables FOR SELECT USING (is_active = true);
CREATE POLICY "Employees can view own orders" ON orders FOR SELECT USING (waiter_id = auth.uid());
CREATE POLICY "Clients view own wallets" ON wallets FOR SELECT USING (client_phone = auth.jwt()->>'phone');  -- Assuming JWT with phone

-- ========================
-- SEED DATA (Sample for Testing)
-- ========================
-- Insert sample tenant (as in original)
INSERT INTO tenants (id, name, legal_name, domain, province, city, address, phone, email, nuit, licenca)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Restaurante Mar Azul',
    'Mar Azul Restaurantes Lda',
    'marazul',
    'Maputo',
    'Maputo',
    'Av. Julius Nyerere 123, Maputo',
    '+258 84 123 4567',
    'contato@marazul.co.mz',
    '123456789',  -- Sample NUIT
    'LIC-2025-001'  -- Sample license
);

-- Insert tenant settings (as in original, with additions)
INSERT INTO tenant_settings (tenant_id, receipt_header_pt, receipt_header_en, receipt_footer_pt, receipt_footer_en)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    'Restaurante Mar Azul - Maputo\nAv. Julius Nyerere 123\nTel: +258 84 123 4567',
    'Mar Azul Restaurant - Maputo\nAv. Julius Nyerere 123\nTel: +258 84 123 4567',
    'Obrigado pela sua visita!\nVolte sempre!',
    'Thank you for your visit!\nCome back soon!'
);

-- Insert sample subscription
INSERT INTO subscriptions (tenant_id, start_date, end_date, status, features_enabled)
VALUES (
    '00000000-0000-0000-0000-000000000001',
    '2025-01-01',
    '2026-01-01',
    'active',
    '{"advanced_reports": true, "qr_events": true}'
);

-- Insert roles (as in original, with additions)
INSERT INTO roles (id, tenant_id, name_pt, name_en, color, can_manage_orders, can_manage_tables, can_manage_menu, can_manage_inventory, can_manage_staff, can_view_reports, can_manage_settings, can_issue_vouchers, can_manage_qr_menus, access_level)
VALUES
    ('00000000-0000-0000-0000-000000000010', '00000000-0000-0000-0000-000000000001', 'Gerente', 'Manager', '#EF4444', true, true, true, true, true, true, true, true, true, 5),
    ('00000000-0000-0000-0000-000000000011', '00000000-0000-0000-0000-000000000001', 'Garçom', 'Waiter', '#3B82F6', true, true, false, false, false, false, false, false, false, 2),
    ('00000000-0000-0000-0000-000000000012', '00000000-0000-0000-0000-000000000001', 'Cozinheiro', 'Chef', '#10B981', true, false, false, true, false, false, false, false, false, 3),
    ('00000000-0000-0000-0000-000000000013', '00000000-0000-0000-0000-000000000001', 'Caixa', 'Cashier', '#F59E0B', false, false, false, false, false, false, false, false, false, 1),
    ('00000000-0000-0000-0000-000000000014', '00000000-0000-0000-0000-000000000001', 'Teller', 'Teller', '#A855F7', false, false, false, false, false, false, false, true, false, 2);  -- For QR events

-- Insert employees (as in original, with additions)
INSERT INTO employees (id, tenant_id, name, email, phone, role_id, pin_hash, assigned_zones, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000020', '00000000-0000-0000-0000-000000000001', 'João Silva', 'joao.silva@marazul.co.mz', '+258 84 111 1111', '00000000-0000-0000-0000-000000000010', 'hashed_pin_1234', '{"indoors"}', true),
    ('00000000-0000-0000-0000-000000000021', '00000000-0000-0000-0000-000000000001', 'Maria Santos', 'maria.santos@marazul.co.mz', '+258 84 222 2222', '00000000-0000-0000-0000-000000000011', 'hashed_pin_2345', '{"terrace"}', true),
    ('00000000-0000-0000-0000-000000000022', '00000000-0000-0000-0000-000000000001', 'Pedro Costa', 'pedro.costa@marazul.co.mz', '+258 84 333 3333', '00000000-0000-0000-0000-000000000011', 'hashed_pin_3456', '{"garden"}', true),
    ('00000000-0000-0000-0000-000000000023', '00000000-0000-0000-0000-000000000001', 'Ana Fernandes', 'ana.fernandes@marazul.co.mz', '+258 84 444 4444', '00000000-0000-0000-0000-000000000012', 'hashed_pin_4567', NULL, true),
    ('00000000-0000-0000-0000-000000000024', '00000000-0000-0000-0000-000000000001', 'Carlos Moiane', 'carlos.moiane@marazul.co.mz', '+258 84 555 5555', '00000000-0000-0000-0000-000000000013', 'hashed_pin_5678', NULL, true);

-- Insert categories (as in original)
INSERT INTO categories (id, tenant_id, name_pt, name_en, description_pt, description_en, display_order, is_active)
VALUES
    ('00000000-0000-0000-0000-000000000030', '00000000-0000-0000-0000-000000000001', 'Entradas', 'Starters', 'Para começar a refeição', 'To start your meal', 1, true),
    ('00000000-0000-0000-0000-000000000031', '00000000-0000-0000-0000-000000000001', 'Pratos Principais', 'Main Courses', 'Pratos principais', 'Main dishes', 2, true),
    ('00000000-0000-0000-0000-000000000032', '00000000-0000-0000-0000-000000000001', 'Sobremesas', 'Desserts', 'Para finalizar', 'To finish', 3, true),
    ('00000000-0000-0000-0000-000000000033', '00000000-0000-0000-0000-000000000001', 'Bebidas', 'Drinks', 'Bebidas refrescantes', 'Refreshing drinks', 4, true);

-- Insert sample supplier
INSERT INTO suppliers (id, tenant_id, name, phone, email)
VALUES (
    '00000000-0000-0000-0000-000000000100',
    '00000000-0000-0000-0000-000000000001',
    'Fornecedor Bebidas MZ',
    '+258 84 666 6666',
    'fornecedor@bebidas.mz'
);

-- Insert sample inventory item
INSERT INTO inventory_items (id, tenant_id, name, category, unit, current_stock, min_stock_level, unit_cost, supplier_id)
VALUES (
    '00000000-0000-0000-0000-000000000110',
    '00000000-0000-0000-0000-000000000001',
    'Cerveja 2M Garrafa',
    'bebidas',
    'garrafa',
    100,
    20,
    35,
    '00000000-0000-0000-0000-000000000100'
);

-- Insert menu items (as in original, linked to inventory)
INSERT INTO menu_items (id, tenant_id, inventory_item_id, name_pt, name_en, description_pt, description_en, category_id, cost_price, selling_price, is_available, image_url, preparation_time, variants, event_eligible)
VALUES
    ('00000000-0000-0000-0000-000000000040', '00000000-0000-0000-0000-000000000001', NULL, 'Camarão Grelhado', 'Grilled Prawns', 'Camarão fresco grelhado com limão e alho', 'Fresh prawns grilled with lemon and garlic', '00000000-0000-0000-0000-000000000030', 180, 450, true, 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400', 15, '{"small": 300, "large": 450}', false),
    -- Add more as needed...

-- Insert restaurant tables (as in original, with qr_code_url)
INSERT INTO restaurant_tables (id, tenant_id, number, status, capacity, location_zone, is_active, qr_code_url)
VALUES
    ('00000000-0000-0000-0000-000000000060', '00000000-0000-0000-0000-000000000001', '1', 'occupied', 4, 'indoors', true, 'https://qr.example.com/table1'),
    -- Add more...

-- Insert sample orders, items, etc., as in original seed data.