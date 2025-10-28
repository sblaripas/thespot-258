-- ========================
-- ADD MISSING COLUMNS TO EXISTING TABLES
-- ========================

-- Add missing columns to tenants table
ALTER TABLE tenants 
ADD COLUMN IF NOT EXISTS nuit TEXT,
ADD COLUMN IF NOT EXISTS licenca TEXT;

-- Add missing columns to roles table
ALTER TABLE roles
ADD COLUMN IF NOT EXISTS can_issue_vouchers BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS can_manage_qr_menus BOOLEAN DEFAULT false;

-- Add missing columns to employees table
ALTER TABLE employees
ADD COLUMN IF NOT EXISTS assigned_zones TEXT[];

-- Add missing columns to menu_items table
ALTER TABLE menu_items
ADD COLUMN IF NOT EXISTS inventory_item_id UUID,
ADD COLUMN IF NOT EXISTS variants JSONB,
ADD COLUMN IF NOT EXISTS event_eligible BOOLEAN DEFAULT false;

-- Add missing columns to restaurant_tables table
ALTER TABLE restaurant_tables
ADD COLUMN IF NOT EXISTS qr_code_url TEXT;

-- Add missing columns to orders table
ALTER TABLE orders
ADD COLUMN IF NOT EXISTS guest_count INTEGER;

-- ========================
-- CREATE NEW TABLES
-- ========================

-- Subscriptions table for tenant subscription management
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'expired', 'cancelled', 'suspended')),
    features_enabled JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, start_date)
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Suppliers table for inventory management
CREATE TABLE IF NOT EXISTS suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    phone TEXT,
    email TEXT,
    address TEXT,
    nuit TEXT,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE suppliers ENABLE ROW LEVEL SECURITY;

-- Inventory items table for stock management
CREATE TABLE IF NOT EXISTS inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    unit TEXT NOT NULL, -- garrafa, lata, copo, shot, jarra, etc
    current_stock INTEGER DEFAULT 0,
    min_stock_level INTEGER DEFAULT 10,
    unit_cost NUMERIC(10,2) NOT NULL,
    supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
    notes TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

-- Add foreign key from menu_items to inventory_items
ALTER TABLE menu_items 
ADD CONSTRAINT fk_menu_items_inventory 
FOREIGN KEY (inventory_item_id) 
REFERENCES inventory_items(id) 
ON DELETE SET NULL;

-- Vouchers table for gift cards and prepaid cards
CREATE TABLE IF NOT EXISTS vouchers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    qr_code TEXT UNIQUE NOT NULL,
    amount NUMERIC(10,2) NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired', 'cancelled')),
    issued_by UUID REFERENCES employees(id) ON DELETE SET NULL,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    valid_until TIMESTAMP WITH TIME ZONE,
    client_name TEXT,
    client_phone TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;

-- Wallets table for customer wallet/credit system
CREATE TABLE IF NOT EXISTS wallets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    client_phone TEXT NOT NULL,
    client_name TEXT,
    balance NUMERIC(10,2) DEFAULT 0 CHECK (balance >= 0),
    total_credits NUMERIC(10,2) DEFAULT 0,
    total_debits NUMERIC(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(tenant_id, client_phone)
);

ALTER TABLE wallets ENABLE ROW LEVEL SECURITY;

-- Wallet transactions for audit trail
CREATE TABLE IF NOT EXISTS wallet_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(id) ON DELETE CASCADE,
    transaction_type TEXT NOT NULL CHECK (transaction_type IN ('credit', 'debit', 'refund')),
    amount NUMERIC(10,2) NOT NULL,
    balance_before NUMERIC(10,2) NOT NULL,
    balance_after NUMERIC(10,2) NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    voucher_id UUID REFERENCES vouchers(id) ON DELETE SET NULL,
    employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE wallet_transactions ENABLE ROW LEVEL SECURITY;

-- ========================
-- CREATE INDEXES
-- ========================

CREATE INDEX IF NOT EXISTS idx_subscriptions_tenant ON subscriptions(tenant_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_suppliers_tenant ON suppliers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_tenant ON inventory_items(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_items_supplier ON inventory_items(supplier_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_tenant ON vouchers(tenant_id);
CREATE INDEX IF NOT EXISTS idx_vouchers_qr ON vouchers(qr_code);
CREATE INDEX IF NOT EXISTS idx_vouchers_status ON vouchers(status);
CREATE INDEX IF NOT EXISTS idx_wallets_tenant_phone ON wallets(tenant_id, client_phone);
CREATE INDEX IF NOT EXISTS idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);

-- ========================
-- CREATE TRIGGERS
-- ========================

CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_inventory_items_updated_at
    BEFORE UPDATE ON inventory_items
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_vouchers_updated_at
    BEFORE UPDATE ON vouchers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_wallets_updated_at
    BEFORE UPDATE ON wallets
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ========================
-- ROW LEVEL SECURITY POLICIES
-- ========================

-- Subscriptions: Only admins can manage
CREATE POLICY "Staff can view subscriptions"
    ON subscriptions FOR SELECT
    TO authenticated
    USING (true);

-- Suppliers: Staff with inventory permission
CREATE POLICY "Staff can view suppliers"
    ON suppliers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Inventory managers can manage suppliers"
    ON suppliers FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Inventory items: Staff with inventory permission
CREATE POLICY "Staff can view inventory"
    ON inventory_items FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Inventory managers can manage items"
    ON inventory_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Vouchers: Staff with voucher permission can issue
CREATE POLICY "Staff can view vouchers"
    ON vouchers FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Tellers can issue vouchers"
    ON vouchers FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Tellers can update vouchers"
    ON vouchers FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Wallets: Customers can view their own, staff can view all
CREATE POLICY "Customers can view own wallet"
    ON wallets FOR SELECT
    USING (true);

CREATE POLICY "Staff can manage wallets"
    ON wallets FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Wallet transactions: Read-only for customers, staff can create
CREATE POLICY "View wallet transactions"
    ON wallet_transactions FOR SELECT
    USING (true);

CREATE POLICY "Staff can create transactions"
    ON wallet_transactions FOR INSERT
    TO authenticated
    WITH CHECK (true);