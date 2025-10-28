-- Seed dummy wallets and orders for testing
-- Phone numbers: 843992929, 823992929, 847855676, 849903268

-- First, let's create wallets for the phone numbers with various balances
INSERT INTO wallets (id, client_phone, balance, activated_at, created_at, updated_at)
VALUES
  (gen_random_uuid(), '843992929', 15000, NOW() - INTERVAL '30 days', NOW() - INTERVAL '30 days', NOW()),
  (gen_random_uuid(), '823992929', 8500, NOW() - INTERVAL '25 days', NOW() - INTERVAL '25 days', NOW()),
  (gen_random_uuid(), '847855676', 22000, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW()),
  (gen_random_uuid(), '849903268', 5000, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW())
ON CONFLICT (client_phone) DO UPDATE
SET 
  balance = EXCLUDED.balance,
  updated_at = NOW();

-- Create some completed orders for wallet 843992929
WITH wallet_1 AS (
  SELECT id FROM wallets WHERE client_phone = '843992929'
),
menu_items_sample AS (
  SELECT id, price FROM menu_items LIMIT 5
),
order_1 AS (
  INSERT INTO orders (id, wallet_id, total_amount, status, order_type, client_confirmed, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    wallet_1.id,
    4500,
    'completed',
    'dine-in',
    true,
    NOW() - INTERVAL '5 days',
    NOW() - INTERVAL '5 days'
  FROM wallet_1
  RETURNING id, wallet_id
)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
SELECT 
  gen_random_uuid(),
  order_1.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  2,
  1500,
  3000,
  NOW() - INTERVAL '5 days'
FROM order_1
UNION ALL
SELECT 
  gen_random_uuid(),
  order_1.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  1,
  1500,
  1500,
  NOW() - INTERVAL '5 days'
FROM order_1;

-- Create a pending order for wallet 823992929
WITH wallet_2 AS (
  SELECT id FROM wallets WHERE client_phone = '823992929'
),
menu_items_sample AS (
  SELECT id, price FROM menu_items LIMIT 5
),
order_2 AS (
  INSERT INTO orders (id, wallet_id, total_amount, status, order_type, client_confirmed, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    wallet_2.id,
    3200,
    'pending',
    'takeout',
    false,
    NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '2 hours'
  FROM wallet_2
  RETURNING id, wallet_id
)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
SELECT 
  gen_random_uuid(),
  order_2.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  3,
  800,
  2400,
  NOW() - INTERVAL '2 hours'
FROM order_2
UNION ALL
SELECT 
  gen_random_uuid(),
  order_2.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  1,
  800,
  800,
  NOW() - INTERVAL '2 hours'
FROM order_2;

-- Create multiple orders for wallet 847855676 (most active user)
WITH wallet_3 AS (
  SELECT id FROM wallets WHERE client_phone = '847855676'
),
menu_items_sample AS (
  SELECT id, price FROM menu_items LIMIT 5
),
order_3a AS (
  INSERT INTO orders (id, wallet_id, total_amount, status, order_type, client_confirmed, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    wallet_3.id,
    6800,
    'completed',
    'dine-in',
    true,
    NOW() - INTERVAL '10 days',
    NOW() - INTERVAL '10 days'
  FROM wallet_3
  RETURNING id, wallet_id
),
order_3b AS (
  INSERT INTO orders (id, wallet_id, total_amount, status, order_type, client_confirmed, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    wallet_3.id,
    5200,
    'completed',
    'dine-in',
    true,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '3 days'
  FROM wallet_3
  RETURNING id, wallet_id
),
order_3c AS (
  INSERT INTO orders (id, wallet_id, total_amount, status, order_type, client_confirmed, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    wallet_3.id,
    4100,
    'preparing',
    'dine-in',
    true,
    NOW() - INTERVAL '30 minutes',
    NOW() - INTERVAL '30 minutes'
  FROM wallet_3
  RETURNING id, wallet_id
)
-- Insert items for order 3a
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
SELECT 
  gen_random_uuid(),
  order_3a.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  4,
  1200,
  4800,
  NOW() - INTERVAL '10 days'
FROM order_3a
UNION ALL
SELECT 
  gen_random_uuid(),
  order_3a.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  2,
  1000,
  2000,
  NOW() - INTERVAL '10 days'
FROM order_3a
UNION ALL
-- Insert items for order 3b
SELECT 
  gen_random_uuid(),
  order_3b.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  3,
  1200,
  3600,
  NOW() - INTERVAL '3 days'
FROM order_3b
UNION ALL
SELECT 
  gen_random_uuid(),
  order_3b.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  2,
  800,
  1600,
  NOW() - INTERVAL '3 days'
FROM order_3b
UNION ALL
-- Insert items for order 3c
SELECT 
  gen_random_uuid(),
  order_3c.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  2,
  1500,
  3000,
  NOW() - INTERVAL '30 minutes'
FROM order_3c
UNION ALL
SELECT 
  gen_random_uuid(),
  order_3c.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  1,
  1100,
  1100,
  NOW() - INTERVAL '30 minutes'
FROM order_3c;

-- Create an order for wallet 849903268
WITH wallet_4 AS (
  SELECT id FROM wallets WHERE client_phone = '849903268'
),
menu_items_sample AS (
  SELECT id, price FROM menu_items LIMIT 5
),
order_4 AS (
  INSERT INTO orders (id, wallet_id, total_amount, status, order_type, client_confirmed, created_at, updated_at)
  SELECT 
    gen_random_uuid(),
    wallet_4.id,
    2800,
    'completed',
    'takeout',
    true,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day'
  FROM wallet_4
  RETURNING id, wallet_id
)
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, created_at)
SELECT 
  gen_random_uuid(),
  order_4.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  2,
  1000,
  2000,
  NOW() - INTERVAL '1 day'
FROM order_4
UNION ALL
SELECT 
  gen_random_uuid(),
  order_4.id,
  (SELECT id FROM menu_items_sample ORDER BY random() LIMIT 1),
  1,
  800,
  800,
  NOW() - INTERVAL '1 day'
FROM order_4;

-- Create transactions for wallet activities
-- Transactions for wallet 843992929
INSERT INTO transactions (id, wallet_id, amount, transaction_type, description, created_at)
SELECT 
  gen_random_uuid(),
  w.id,
  10000,
  'deposit',
  'Initial wallet activation',
  NOW() - INTERVAL '30 days'
FROM wallets w WHERE w.client_phone = '843992929'
UNION ALL
SELECT 
  gen_random_uuid(),
  w.id,
  5000,
  'deposit',
  'Top-up via voucher',
  NOW() - INTERVAL '15 days'
FROM wallets w WHERE w.client_phone = '843992929'
UNION ALL
SELECT 
  gen_random_uuid(),
  w.id,
  -4500,
  'payment',
  'Order payment',
  NOW() - INTERVAL '5 days'
FROM wallets w WHERE w.client_phone = '843992929';

-- Transactions for wallet 823992929
INSERT INTO transactions (id, wallet_id, amount, transaction_type, description, created_at)
SELECT 
  gen_random_uuid(),
  w.id,
  8500,
  'deposit',
  'Initial wallet activation',
  NOW() - INTERVAL '25 days'
FROM wallets w WHERE w.client_phone = '823992929';

-- Transactions for wallet 847855676
INSERT INTO transactions (id, wallet_id, amount, transaction_type, description, created_at)
SELECT 
  gen_random_uuid(),
  w.id,
  20000,
  'deposit',
  'Initial wallet activation',
  NOW() - INTERVAL '20 days'
FROM wallets w WHERE w.client_phone = '847855676'
UNION ALL
SELECT 
  gen_random_uuid(),
  w.id,
  10000,
  'deposit',
  'Top-up via voucher',
  NOW() - INTERVAL '12 days'
FROM wallets w WHERE w.client_phone = '847855676'
UNION ALL
SELECT 
  gen_random_uuid(),
  w.id,
  -6800,
  'payment',
  'Order payment',
  NOW() - INTERVAL '10 days'
FROM wallets w WHERE w.client_phone = '847855676'
UNION ALL
SELECT 
  gen_random_uuid(),
  w.id,
  -5200,
  'payment',
  'Order payment',
  NOW() - INTERVAL '3 days'
FROM wallets w WHERE w.client_phone = '847855676';

-- Transactions for wallet 849903268
INSERT INTO transactions (id, wallet_id, amount, transaction_type, description, created_at)
SELECT 
  gen_random_uuid(),
  w.id,
  5000,
  'deposit',
  'Initial wallet activation',
  NOW() - INTERVAL '15 days'
FROM wallets w WHERE w.client_phone = '849903268'
UNION ALL
SELECT 
  gen_random_uuid(),
  w.id,
  -2800,
  'payment',
  'Order payment',
  NOW() - INTERVAL '1 day'
FROM wallets w WHERE w.client_phone = '849903268';
