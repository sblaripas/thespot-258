-- Create inventory_logs table if it doesn't exist
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

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_inventory_logs_item ON inventory_logs(menu_item_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_tenant ON inventory_logs(tenant_id);
CREATE INDEX IF NOT EXISTS idx_inventory_logs_created ON inventory_logs(created_at);

-- Create function to log inventory changes
CREATE OR REPLACE FUNCTION log_inventory_change()
RETURNS TRIGGER AS $$
DECLARE
    old_stock INTEGER;
    change_amt INTEGER;
BEGIN
    -- Get the old stock value
    old_stock := OLD.stock_count;
    change_amt := NEW.stock_count - old_stock;
    
    -- Only log if stock actually changed
    IF change_amt != 0 THEN
        INSERT INTO inventory_logs (
            tenant_id,
            menu_item_id,
            change_type,
            change_amount,
            previous_stock,
            new_stock,
            reason_pt,
            reason_en,
            cost_impact
        ) VALUES (
            NEW.tenant_id,
            NEW.id,
            CASE 
                WHEN change_amt < 0 THEN 'sale'
                WHEN change_amt > 0 THEN 'purchase'
                ELSE 'adjustment'
            END,
            change_amt,
            old_stock,
            NEW.stock_count,
            'Automatic stock update',
            'Automatic stock update',
            change_amt * NEW.cost_price
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic inventory logging
DROP TRIGGER IF EXISTS trigger_log_inventory ON menu_items;
CREATE TRIGGER trigger_log_inventory 
AFTER UPDATE OF stock_count ON menu_items 
FOR EACH ROW 
EXECUTE FUNCTION log_inventory_change();

-- Create view for low stock alerts
CREATE OR REPLACE VIEW low_stock_alerts AS
SELECT 
    mi.tenant_id,
    mi.id AS menu_item_id,
    mi.name_pt,
    mi.name_en,
    mi.stock_count,
    mi.low_stock_threshold,
    mi.track_stock,
    mi.is_available
FROM menu_items mi
WHERE mi.track_stock = TRUE 
  AND mi.stock_count <= mi.low_stock_threshold
  AND mi.is_available = TRUE;
