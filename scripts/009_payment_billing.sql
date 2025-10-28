-- Create payments table
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_payments_tenant ON payments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(order_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(payment_status);
CREATE INDEX IF NOT EXISTS idx_payments_created ON payments(created_at);

-- Function to generate bill number
CREATE OR REPLACE FUNCTION generate_bill_number()
RETURNS TRIGGER AS $$
DECLARE
    tenant_code TEXT;
    bill_seq BIGINT;
    new_bill_number TEXT;
BEGIN
    -- Get tenant code (first 3 letters of name)
    SELECT UPPER(SUBSTRING(name FROM 1 FOR 3)) INTO tenant_code 
    FROM tenants WHERE id = NEW.tenant_id;
    
    -- Get next sequence for this tenant (using order count as approximation)
    SELECT COUNT(*) + 1 INTO bill_seq
    FROM payments WHERE tenant_id = NEW.tenant_id;
    
    -- Format: TENANT-BILL-YEAR-MONTH-SEQUENCE
    new_bill_number := tenant_code || '-BILL-' || 
                       TO_CHAR(NEW.created_at, 'YYMM') || '-' || 
                       LPAD(bill_seq::text, 5, '0');
    
    NEW.bill_number := new_bill_number;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for bill number generation
DROP TRIGGER IF EXISTS trigger_bill_number ON payments;
CREATE TRIGGER trigger_bill_number 
BEFORE INSERT ON payments 
FOR EACH ROW 
EXECUTE FUNCTION generate_bill_number();

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_payments_updated ON payments;
CREATE TRIGGER trigger_payments_updated 
BEFORE UPDATE ON payments 
FOR EACH ROW 
EXECUTE FUNCTION update_updated_at();
