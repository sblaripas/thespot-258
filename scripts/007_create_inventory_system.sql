-- Create inventory_items table for tracking individual items and components
CREATE TABLE IF NOT EXISTS inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100) NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'unit', -- unit, kg, liter, ml, etc.
  current_stock DECIMAL(10, 2) NOT NULL DEFAULT 0,
  min_stock_level DECIMAL(10, 2) NOT NULL DEFAULT 0,
  max_stock_level DECIMAL(10, 2),
  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  supplier VARCHAR(255),
  barcode VARCHAR(100),
  sku VARCHAR(100),
  is_composite BOOLEAN DEFAULT FALSE, -- true if item is made of components
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create item_components table for composite items (e.g., cocktails with ingredients)
CREATE TABLE IF NOT EXISTS item_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  component_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_required DECIMAL(10, 2) NOT NULL, -- how much of component is needed
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(parent_item_id, component_item_id)
);

-- Create stock_adjustments table for tracking all stock changes
CREATE TABLE IF NOT EXISTS stock_adjustments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  adjustment_type VARCHAR(50) NOT NULL, -- 'increase', 'decrease', 'sale', 'waste', 'production', 'count'
  quantity DECIMAL(10, 2) NOT NULL,
  previous_stock DECIMAL(10, 2) NOT NULL,
  new_stock DECIMAL(10, 2) NOT NULL,
  reason VARCHAR(255),
  notes TEXT,
  reference_id UUID, -- can link to order_id, production_batch_id, etc.
  reference_type VARCHAR(50), -- 'order', 'production', 'count', 'manual'
  adjusted_by VARCHAR(100), -- staff phone or user id
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_counts table for physical inventory counts
CREATE TABLE IF NOT EXISTS inventory_counts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  count_type VARCHAR(50) NOT NULL DEFAULT 'full', -- 'full', 'partial'
  status VARCHAR(50) NOT NULL DEFAULT 'in_progress', -- 'in_progress', 'completed', 'cancelled'
  counted_by VARCHAR(100) NOT NULL,
  notes TEXT,
  total_variance DECIMAL(10, 2) DEFAULT 0,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create inventory_count_items table for individual items in a count
CREATE TABLE IF NOT EXISTS inventory_count_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  count_id UUID NOT NULL REFERENCES inventory_counts(id) ON DELETE CASCADE,
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  expected_quantity DECIMAL(10, 2) NOT NULL,
  counted_quantity DECIMAL(10, 2),
  variance DECIMAL(10, 2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(count_id, inventory_item_id)
);

-- Create production_batches table for pre-prepared items
CREATE TABLE IF NOT EXISTS production_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produced_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  quantity_produced DECIMAL(10, 2) NOT NULL,
  production_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  produced_by VARCHAR(100) NOT NULL,
  batch_number VARCHAR(100),
  expiry_date TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'completed', -- 'completed', 'in_progress', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create low_stock_alerts table for managing alerts
CREATE TABLE IF NOT EXISTS low_stock_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE CASCADE,
  alert_level DECIMAL(10, 2) NOT NULL,
  current_stock DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'acknowledged', 'resolved'
  acknowledged_by VARCHAR(100),
  acknowledged_at TIMESTAMP WITH TIME ZONE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discounts table for tracking discounts
CREATE TABLE IF NOT EXISTS discounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  order_item_id UUID REFERENCES order_items(id) ON DELETE CASCADE,
  discount_type VARCHAR(50) NOT NULL, -- 'percentage', 'fixed_amount', 'voucher'
  discount_value DECIMAL(10, 2) NOT NULL,
  discount_amount DECIMAL(10, 2) NOT NULL, -- actual amount discounted
  reason VARCHAR(255),
  approved_by VARCHAR(100),
  applied_by VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_inventory_items_category ON inventory_items(category);
CREATE INDEX IF NOT EXISTS idx_inventory_items_barcode ON inventory_items(barcode);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_item ON stock_adjustments(inventory_item_id);
CREATE INDEX IF NOT EXISTS idx_stock_adjustments_date ON stock_adjustments(created_at);
CREATE INDEX IF NOT EXISTS idx_inventory_counts_date ON inventory_counts(count_date);
CREATE INDEX IF NOT EXISTS idx_production_batches_item ON production_batches(produced_item_id);
CREATE INDEX IF NOT EXISTS idx_low_stock_alerts_status ON low_stock_alerts(status);
CREATE INDEX IF NOT EXISTS idx_discounts_order ON discounts(order_id);

-- Enable RLS on all tables
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE item_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_counts ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_count_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE low_stock_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allow all for authenticated users - adjust based on your auth setup)
CREATE POLICY "Allow all operations on inventory_items" ON inventory_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on item_components" ON item_components FOR ALL USING (true);
CREATE POLICY "Allow all operations on stock_adjustments" ON stock_adjustments FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory_counts" ON inventory_counts FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory_count_items" ON inventory_count_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on production_batches" ON production_batches FOR ALL USING (true);
CREATE POLICY "Allow all operations on low_stock_alerts" ON low_stock_alerts FOR ALL USING (true);
CREATE POLICY "Allow all operations on discounts" ON discounts FOR ALL USING (true);

-- Create function to automatically create low stock alerts
CREATE OR REPLACE FUNCTION check_low_stock()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if stock is below minimum level
  IF NEW.current_stock <= NEW.min_stock_level THEN
    -- Insert alert if one doesn't already exist
    INSERT INTO low_stock_alerts (inventory_item_id, alert_level, current_stock, status)
    VALUES (NEW.id, NEW.min_stock_level, NEW.current_stock, 'active')
    ON CONFLICT DO NOTHING;
  ELSE
    -- Resolve any active alerts if stock is above minimum
    UPDATE low_stock_alerts
    SET status = 'resolved', resolved_at = NOW()
    WHERE inventory_item_id = NEW.id AND status = 'active';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for low stock alerts
DROP TRIGGER IF EXISTS trigger_check_low_stock ON inventory_items;
CREATE TRIGGER trigger_check_low_stock
  AFTER INSERT OR UPDATE OF current_stock ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION check_low_stock();

-- Create function to update inventory_items.updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS trigger_update_inventory_items_updated_at ON inventory_items;
CREATE TRIGGER trigger_update_inventory_items_updated_at
  BEFORE UPDATE ON inventory_items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
