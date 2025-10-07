-- Seed some basic inventory items (ingredients and components)
INSERT INTO inventory_items (name, description, category, unit, current_stock, min_stock_level, unit_cost, is_composite) VALUES
-- Beverages - Base ingredients
('Vodka', 'Premium vodka for cocktails', 'spirits', 'liter', 15.5, 5.0, 800, false),
('Rum', 'White rum for cocktails', 'spirits', 'liter', 12.0, 5.0, 750, false),
('Gin', 'London dry gin', 'spirits', 'liter', 10.0, 4.0, 900, false),
('Tequila', 'Silver tequila', 'spirits', 'liter', 8.0, 3.0, 1000, false),
('Whiskey', 'Bourbon whiskey', 'spirits', 'liter', 6.0, 2.0, 1200, false),

-- Mixers
('Coca-Cola', 'Coca-Cola 330ml', 'mixers', 'unit', 120, 30, 25, false),
('Sprite', 'Sprite 330ml', 'mixers', 'unit', 100, 30, 25, false),
('Tonic Water', 'Tonic water 330ml', 'mixers', 'unit', 80, 20, 30, false),
('Orange Juice', 'Fresh orange juice', 'mixers', 'liter', 10.0, 3.0, 150, false),
('Cranberry Juice', 'Cranberry juice', 'mixers', 'liter', 8.0, 2.0, 180, false),
('Lime Juice', 'Fresh lime juice', 'mixers', 'liter', 5.0, 2.0, 200, false),
('Simple Syrup', 'Sugar syrup', 'mixers', 'liter', 6.0, 2.0, 100, false),

-- Garnishes
('Lime', 'Fresh limes', 'garnishes', 'unit', 50, 15, 5, false),
('Lemon', 'Fresh lemons', 'garnishes', 'unit', 40, 15, 5, false),
('Mint', 'Fresh mint leaves', 'garnishes', 'bunch', 20, 5, 15, false),
('Ice', 'Ice cubes', 'garnishes', 'kg', 100, 20, 10, false),

-- Food ingredients
('Beef Patty', 'Burger patty', 'food', 'unit', 80, 20, 150, false),
('Chicken Breast', 'Grilled chicken breast', 'food', 'unit', 60, 15, 180, false),
('Bun', 'Burger bun', 'food', 'unit', 100, 25, 20, false),
('Cheese Slice', 'Cheddar cheese slice', 'food', 'unit', 120, 30, 15, false),
('Lettuce', 'Fresh lettuce', 'food', 'unit', 40, 10, 10, false),
('Tomato', 'Fresh tomato', 'food', 'unit', 50, 10, 8, false),
('Onion', 'Fresh onion', 'food', 'unit', 60, 15, 5, false),
('French Fries', 'Frozen french fries', 'food', 'kg', 30, 10, 200, false)

ON CONFLICT DO NOTHING;

-- Create some composite items (cocktails)
INSERT INTO inventory_items (name, description, category, unit, current_stock, min_stock_level, unit_cost, is_composite) VALUES
('Mojito', 'Classic mojito cocktail', 'cocktails', 'unit', 0, 0, 0, true),
('Caipirinha', 'Brazilian caipirinha', 'cocktails', 'unit', 0, 0, 0, true),
('Gin & Tonic', 'Classic gin and tonic', 'cocktails', 'unit', 0, 0, 0, true),
('Rum & Coke', 'Rum and coca-cola', 'cocktails', 'unit', 0, 0, 0, true),
('Cheeseburger', 'Classic cheeseburger', 'food', 'unit', 0, 0, 0, true)
ON CONFLICT DO NOTHING;

-- Link components to composite items
-- Mojito components
INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Mojito'),
  (SELECT id FROM inventory_items WHERE name = 'Rum'),
  0.05 -- 50ml
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Mojito')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Mojito'),
  (SELECT id FROM inventory_items WHERE name = 'Lime Juice'),
  0.03 -- 30ml
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Mojito')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Mojito'),
  (SELECT id FROM inventory_items WHERE name = 'Simple Syrup'),
  0.02 -- 20ml
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Mojito')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Mojito'),
  (SELECT id FROM inventory_items WHERE name = 'Mint'),
  0.1 -- 10% of a bunch
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Mojito')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Mojito'),
  (SELECT id FROM inventory_items WHERE name = 'Sprite'),
  1 -- 1 can
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Mojito')
ON CONFLICT DO NOTHING;

-- Gin & Tonic components
INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Gin & Tonic'),
  (SELECT id FROM inventory_items WHERE name = 'Gin'),
  0.05 -- 50ml
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Gin & Tonic')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Gin & Tonic'),
  (SELECT id FROM inventory_items WHERE name = 'Tonic Water'),
  1 -- 1 can
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Gin & Tonic')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Gin & Tonic'),
  (SELECT id FROM inventory_items WHERE name = 'Lime'),
  0.25 -- quarter lime
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Gin & Tonic')
ON CONFLICT DO NOTHING;

-- Cheeseburger components
INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Cheeseburger'),
  (SELECT id FROM inventory_items WHERE name = 'Beef Patty'),
  1
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Cheeseburger')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Cheeseburger'),
  (SELECT id FROM inventory_items WHERE name = 'Bun'),
  1
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Cheeseburger')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Cheeseburger'),
  (SELECT id FROM inventory_items WHERE name = 'Cheese Slice'),
  1
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Cheeseburger')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Cheeseburger'),
  (SELECT id FROM inventory_items WHERE name = 'Lettuce'),
  1
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Cheeseburger')
ON CONFLICT DO NOTHING;

INSERT INTO item_components (parent_item_id, component_item_id, quantity_required)
SELECT 
  (SELECT id FROM inventory_items WHERE name = 'Cheeseburger'),
  (SELECT id FROM inventory_items WHERE name = 'Tomato'),
  1
WHERE EXISTS (SELECT 1 FROM inventory_items WHERE name = 'Cheeseburger')
ON CONFLICT DO NOTHING;
