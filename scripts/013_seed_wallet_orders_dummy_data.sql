-- Seed dummy data for wallet orders feature
-- This creates wallets with orders, payments, and various statuses for testing

-- First, ensure we have some menu items
INSERT INTO menu_items (id, name, description, price, category, stock_quantity, min_stock_alert, is_available)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Caipirinha', 'Traditional Brazilian cocktail', 250, 'Cocktails', 50, 10, true),
  ('22222222-2222-2222-2222-222222222222', 'Mojito', 'Cuban highball cocktail', 280, 'Cocktails', 45, 10, true),
  ('33333333-3333-3333-3333-333333333333', 'Pastel de Carne', 'Beef pastry', 150, 'Food', 30, 5, true),
  ('44444444-4444-4444-4444-444444444444', 'Cerveja Laurentina', 'Local beer', 120, 'Beer', 100, 20, true),
  ('55555555-5555-5555-5555-555555555555', 'Água Mineral', 'Mineral water', 50, 'Beverages', 80, 15, true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  stock_quantity = EXCLUDED.stock_quantity;

-- Create wallets for test phone numbers
INSERT INTO wallets (id, client_phone, balance, activated_at, created_at, updated_at)
VALUES
  ('a1111111-1111-1111-1111-111111111111', '843992929', 5000, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW()),
  ('a2222222-2222-2222-2222-222222222222', '823992929', 3500, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW()),
  ('a3333333-3333-3333-3333-333333333333', '873992929', 7200, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (id) DO UPDATE SET
  balance = EXCLUDED.balance,
  activated_at = EXCLUDED.activated_at;

-- Create orders for today (completed, pending, canceled)
-- Wallet 1 (843992929) - Has completed and pending orders
INSERT INTO orders (id, wallet_id, status, order_type, total_amount, client_confirmed, created_at, updated_at)
VALUES
  -- Completed order from today
  ('b1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'completed', 'qr_scan', 530, true, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
  -- Pending order from today
  ('b2222222-2222-2222-2222-222222222222', 'a1111111-1111-1111-1111-111111111111', 'pending', 'qr_scan', 400, false, NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
  -- Canceled order from today
  ('b3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 'canceled', 'qr_scan', 280, false, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount;

-- Wallet 2 (823992929) - Has completed and canceled orders
INSERT INTO orders (id, wallet_id, status, order_type, total_amount, client_confirmed, created_at, updated_at)
VALUES
  ('b4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', 'completed', 'qr_scan', 670, true, NOW() - INTERVAL '4 hours', NOW() - INTERVAL '3 hours'),
  ('b5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 'canceled', 'qr_scan', 150, false, NOW() - INTERVAL '1 hour', NOW() - INTERVAL '45 minutes')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount;

-- Wallet 3 (873992929) - Has multiple completed and pending orders
INSERT INTO orders (id, wallet_id, status, order_type, total_amount, client_confirmed, created_at, updated_at)
VALUES
  ('b6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', 'completed', 'qr_scan', 800, true, NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours'),
  ('b7777777-7777-7777-7777-777777777777', 'a3333333-3333-3333-3333-333333333333', 'pending', 'qr_scan', 560, false, NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '20 minutes'),
  ('b8888888-8888-8888-8888-888888888888', 'a3333333-3333-3333-3333-333333333333', 'completed', 'qr_scan', 420, true, NOW() - INTERVAL '6 hours', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  total_amount = EXCLUDED.total_amount;

-- Add order items for each order
-- Order 1 (completed)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c1111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 2, 250, 500, NOW() - INTERVAL '2 hours'),
  ('c1111112-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', '55555555-5555-5555-5555-555555555555', 1, 50, 50, NOW() - INTERVAL '2 hours')
ON CONFLICT (id) DO NOTHING;

-- Order 2 (pending)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c2222221-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 1, 280, 280, NOW() - INTERVAL '30 minutes'),
  ('c2222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 1, 120, 120, NOW() - INTERVAL '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- Order 3 (canceled)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c3333331-3333-3333-3333-333333333333', 'b3333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 1, 280, 280, NOW() - INTERVAL '3 hours')
ON CONFLICT (id) DO NOTHING;

-- Order 4 (completed)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c4444441-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', 2, 250, 500, NOW() - INTERVAL '4 hours'),
  ('c4444442-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 1, 120, 120, NOW() - INTERVAL '4 hours'),
  ('c4444443-4444-4444-4444-444444444444', 'b4444444-4444-4444-4444-444444444444', '55555555-5555-5555-5555-555555555555', 1, 50, 50, NOW() - INTERVAL '4 hours')
ON CONFLICT (id) DO NOTHING;

-- Order 5 (canceled)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c5555551-5555-5555-5555-555555555555', 'b5555555-5555-5555-5555-555555555555', '33333333-3333-3333-3333-333333333333', 1, 150, 150, NOW() - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Order 6 (completed)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c6666661-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', 2, 250, 500, NOW() - INTERVAL '5 hours'),
  ('c6666662-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', '22222222-2222-2222-2222-222222222222', 1, 280, 280, NOW() - INTERVAL '5 hours'),
  ('c6666663-6666-6666-6666-666666666666', 'b6666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555', 1, 50, 50, NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Order 7 (pending)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c7777771-7777-7777-7777-777777777777', 'b7777777-7777-7777-7777-777777777777', '22222222-2222-2222-2222-222222222222', 2, 280, 560, NOW() - INTERVAL '20 minutes')
ON CONFLICT (id) DO NOTHING;

-- Order 8 (completed)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
VALUES
  ('c8888881-8888-8888-8888-888888888888', 'b8888888-8888-8888-8888-888888888888', '33333333-3333-3333-3333-333333333333', 2, 150, 300, NOW() - INTERVAL '6 hours'),
  ('c8888882-8888-8888-8888-888888888888', 'b8888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 1, 120, 120, NOW() - INTERVAL '6 hours')
ON CONFLICT (id) DO NOTHING;

-- Add transactions for completed orders (payments)
INSERT INTO transactions (id, wallet_id, amount, transaction_type, description, order_id, created_at)
VALUES
  ('d1111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', -530, 'payment', 'Payment for order', 'b1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 hour'),
  ('d4444444-4444-4444-4444-444444444444', 'a2222222-2222-2222-2222-222222222222', -670, 'payment', 'Payment for order', 'b4444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 hours'),
  ('d6666666-6666-6666-6666-666666666666', 'a3333333-3333-3333-3333-333333333333', -800, 'payment', 'Payment for order', 'b6666666-6666-6666-6666-666666666666', NOW() - INTERVAL '4 hours'),
  ('d8888888-8888-8888-8888-888888888888', 'a3333333-3333-3333-3333-333333333333', -420, 'payment', 'Payment for order', 'b8888888-8888-8888-8888-888888888888', NOW() - INTERVAL '5 hours')
ON CONFLICT (id) DO NOTHING;

-- Add some refund transactions for canceled orders
INSERT INTO transactions (id, wallet_id, amount, transaction_type, description, order_id, created_at)
VALUES
  ('d3333333-3333-3333-3333-333333333333', 'a1111111-1111-1111-1111-111111111111', 280, 'refund', 'Refund for canceled order', 'b3333333-3333-3333-3333-333333333333', NOW() - INTERVAL '2 hours'),
  ('d5555555-5555-5555-5555-555555555555', 'a2222222-2222-2222-2222-222222222222', 150, 'refund', 'Refund for canceled order', 'b5555555-5555-5555-5555-555555555555', NOW() - INTERVAL '45 minutes')
ON CONFLICT (id) DO NOTHING;
