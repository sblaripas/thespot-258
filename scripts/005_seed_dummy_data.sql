-- Comprehensive dummy data for The Spot restaurant app
-- This script populates all tables with realistic test data

-- Clear existing data (in reverse order of dependencies)
TRUNCATE TABLE audit_log CASCADE;
TRUNCATE TABLE table_assignments CASCADE;
TRUNCATE TABLE transactions CASCADE;
TRUNCATE TABLE order_items CASCADE;
TRUNCATE TABLE orders CASCADE;
TRUNCATE TABLE wallets CASCADE;
TRUNCATE TABLE vouchers CASCADE;
TRUNCATE TABLE tables CASCADE;
TRUNCATE TABLE menu_items CASCADE;
TRUNCATE TABLE users CASCADE;

-- ============================================
-- 1. USERS (Staff Members)
-- ============================================
INSERT INTO users (id, name, phone, role, created_at, updated_at) VALUES
-- Admin
('11111111-1111-1111-1111-111111111111', 'John Manager', '+1234567890', 'admin', NOW(), NOW()),

-- Waiters
('22222222-2222-2222-2222-222222222222', 'Sarah Williams', '+1234567891', 'waiter', NOW(), NOW()),
('22222222-2222-2222-2222-222222222223', 'Mike Johnson', '+1234567892', 'waiter', NOW(), NOW()),
('22222222-2222-2222-2222-222222222224', 'Emily Davis', '+1234567893', 'waiter', NOW(), NOW()),

-- Kitchen Staff
('33333333-3333-3333-3333-333333333333', 'Chef Antonio', '+1234567894', 'kitchen', NOW(), NOW()),
('33333333-3333-3333-3333-333333333334', 'Chef Maria', '+1234567895', 'kitchen', NOW(), NOW());

-- ============================================
-- 2. MENU ITEMS (Food & Drinks)
-- ============================================
INSERT INTO menu_items (id, name, description, price, category, is_available, stock_quantity, min_stock_alert, created_at, updated_at) VALUES
-- Appetizers
('a1111111-1111-1111-1111-111111111111', 'Bruschetta', 'Toasted bread with tomatoes, garlic, and basil', 850, 'Appetizers', true, 50, 10, NOW(), NOW()),
('a1111111-1111-1111-1111-111111111112', 'Calamari Fritti', 'Crispy fried squid with marinara sauce', 1200, 'Appetizers', true, 30, 5, NOW(), NOW()),
('a1111111-1111-1111-1111-111111111113', 'Caprese Salad', 'Fresh mozzarella, tomatoes, and basil', 950, 'Appetizers', true, 40, 8, NOW(), NOW()),
('a1111111-1111-1111-1111-111111111114', 'Garlic Bread', 'Toasted bread with garlic butter', 600, 'Appetizers', true, 60, 15, NOW(), NOW()),

-- Main Courses
('b2222222-2222-2222-2222-222222222221', 'Margherita Pizza', 'Classic pizza with tomato, mozzarella, and basil', 1400, 'Main Courses', true, 100, 20, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222222', 'Pepperoni Pizza', 'Pizza with pepperoni and mozzarella', 1600, 'Main Courses', true, 100, 20, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222223', 'Spaghetti Carbonara', 'Pasta with bacon, eggs, and parmesan', 1500, 'Main Courses', true, 80, 15, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222224', 'Fettuccine Alfredo', 'Pasta with creamy parmesan sauce', 1450, 'Main Courses', true, 80, 15, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222225', 'Grilled Salmon', 'Fresh salmon with lemon butter sauce', 2200, 'Main Courses', true, 40, 8, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222226', 'Ribeye Steak', 'Premium ribeye with garlic butter', 2800, 'Main Courses', true, 30, 5, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222227', 'Chicken Parmesan', 'Breaded chicken with marinara and mozzarella', 1800, 'Main Courses', true, 60, 12, NOW(), NOW()),
('b2222222-2222-2222-2222-222222222228', 'Vegetable Lasagna', 'Layered pasta with vegetables and cheese', 1650, 'Main Courses', true, 50, 10, NOW(), NOW()),

-- Desserts
('c3333333-3333-3333-3333-333333333331', 'Tiramisu', 'Classic Italian coffee-flavored dessert', 800, 'Desserts', true, 40, 8, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333332', 'Panna Cotta', 'Creamy vanilla dessert with berry sauce', 750, 'Desserts', true, 40, 8, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333333', 'Chocolate Lava Cake', 'Warm chocolate cake with molten center', 900, 'Desserts', true, 35, 7, NOW(), NOW()),
('c3333333-3333-3333-3333-333333333334', 'Gelato', 'Italian ice cream (3 scoops)', 650, 'Desserts', true, 100, 20, NOW(), NOW()),

-- Beverages
('d4444444-4444-4444-4444-444444444441', 'Espresso', 'Strong Italian coffee', 350, 'Beverages', true, 200, 40, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444442', 'Cappuccino', 'Espresso with steamed milk foam', 450, 'Beverages', true, 200, 40, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444443', 'Latte', 'Espresso with steamed milk', 450, 'Beverages', true, 200, 40, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444444', 'Fresh Orange Juice', 'Freshly squeezed orange juice', 500, 'Beverages', true, 80, 15, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444445', 'Coca Cola', 'Classic soft drink', 300, 'Beverages', true, 150, 30, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444446', 'Sparkling Water', 'San Pellegrino sparkling water', 400, 'Beverages', true, 120, 25, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444447', 'Red Wine (Glass)', 'House red wine', 800, 'Beverages', true, 60, 12, NOW(), NOW()),
('d4444444-4444-4444-4444-444444444448', 'White Wine (Glass)', 'House white wine', 800, 'Beverages', true, 60, 12, NOW(), NOW());

-- ============================================
-- 3. TABLES (Restaurant Tables with QR Codes)
-- ============================================
INSERT INTO tables (id, table_number, status, qr_code, assigned_waiter_id, created_at, updated_at) VALUES
('t1111111-1111-1111-1111-111111111111', 1, 'available', 'QR-TABLE-001', NULL, NOW(), NOW()),
('t1111111-1111-1111-1111-111111111112', 2, 'available', 'QR-TABLE-002', NULL, NOW(), NOW()),
('t1111111-1111-1111-1111-111111111113', 3, 'occupied', 'QR-TABLE-003', '22222222-2222-2222-2222-222222222222', NOW() - INTERVAL '30 minutes', NOW()),
('t1111111-1111-1111-1111-111111111114', 4, 'occupied', 'QR-TABLE-004', '22222222-2222-2222-2222-222222222223', NOW() - INTERVAL '45 minutes', NOW()),
('t1111111-1111-1111-1111-111111111115', 5, 'available', 'QR-TABLE-005', NULL, NOW(), NOW()),
('t1111111-1111-1111-1111-111111111116', 6, 'occupied', 'QR-TABLE-006', '22222222-2222-2222-2222-222222222224', NOW() - INTERVAL '15 minutes', NOW()),
('t1111111-1111-1111-1111-111111111117', 7, 'available', 'QR-TABLE-007', NULL, NOW(), NOW()),
('t1111111-1111-1111-1111-111111111118', 8, 'reserved', 'QR-TABLE-008', '22222222-2222-2222-2222-222222222222', NOW(), NOW()),
('t1111111-1111-1111-1111-111111111119', 9, 'available', 'QR-TABLE-009', NULL, NOW(), NOW()),
('t1111111-1111-1111-1111-111111111120', 10, 'available', 'QR-TABLE-010', NULL, NOW(), NOW());

-- ============================================
-- 4. VOUCHERS (Gift Vouchers)
-- ============================================
INSERT INTO vouchers (id, amount, qr_code, status, client_phone, issued_by, issued_at, created_at) VALUES
('v1111111-1111-1111-1111-111111111111', 5000, 'VOUCHER-5K-001', 'active', '+1555000001', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
('v1111111-1111-1111-1111-111111111112', 10000, 'VOUCHER-10K-001', 'active', '+1555000002', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
('v1111111-1111-1111-1111-111111111113', 2500, 'VOUCHER-2.5K-001', 'redeemed', '+1555000003', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days'),
('v1111111-1111-1111-1111-111111111114', 7500, 'VOUCHER-7.5K-001', 'active', '+1555000004', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
('v1111111-1111-1111-1111-111111111115', 15000, 'VOUCHER-15K-001', 'active', '+1555000005', '11111111-1111-1111-1111-111111111111', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- ============================================
-- 5. WALLETS (Client Wallets)
-- ============================================
INSERT INTO wallets (id, client_phone, balance, voucher_id, activated_at, created_at, updated_at) VALUES
('w1111111-1111-1111-1111-111111111111', '+1555000001', 4200, 'v1111111-1111-1111-1111-111111111111', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW()),
('w1111111-1111-1111-1111-111111111112', '+1555000002', 8500, 'v1111111-1111-1111-1111-111111111112', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW()),
('w1111111-1111-1111-1111-111111111113', '+1555000003', 0, 'v1111111-1111-1111-1111-111111111113', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', NOW()),
('w1111111-1111-1111-1111-111111111114', '+1555000004', 6800, 'v1111111-1111-1111-1111-111111111114', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW()),
('w1111111-1111-1111-1111-111111111115', '+1555000005', 15000, 'v1111111-1111-1111-1111-111111111115', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW()),
-- Additional wallets without vouchers (topped up directly)
('w1111111-1111-1111-1111-111111111116', '+1555000006', 3500, NULL, NOW() - INTERVAL '7 days', NOW() - INTERVAL '7 days', NOW()),
('w1111111-1111-1111-1111-111111111117', '+1555000007', 5200, NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW());

-- ============================================
-- 6. ORDERS (Customer Orders)
-- ============================================
INSERT INTO orders (id, wallet_id, table_id, order_type, status, total_amount, staff_id, client_confirmed, notes, created_at, updated_at) VALUES
-- Completed orders
('o1111111-1111-1111-1111-111111111111', 'w1111111-1111-1111-1111-111111111113', 't1111111-1111-1111-1111-111111111113', 'dine-in', 'completed', 2500, '22222222-2222-2222-2222-222222222222', true, 'Extra napkins please', NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour'),
('o1111111-1111-1111-1111-111111111112', 'w1111111-1111-1111-1111-111111111116', 't1111111-1111-1111-1111-111111111114', 'dine-in', 'completed', 3200, '22222222-2222-2222-2222-222222222223', true, NULL, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours'),

-- Active orders (in progress)
('o1111111-1111-1111-1111-111111111113', 'w1111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111113', 'dine-in', 'preparing', 1800, '22222222-2222-2222-2222-222222222222', true, 'No onions', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '25 minutes'),
('o1111111-1111-1111-1111-111111111114', 'w1111111-1111-1111-1111-111111111112', 't1111111-1111-1111-1111-111111111114', 'dine-in', 'ready', 4500, '22222222-2222-2222-2222-222222222223', true, NULL, NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '10 minutes'),
('o1111111-1111-1111-1111-111111111115', 'w1111111-1111-1111-1111-111111111114', 't1111111-1111-1111-1111-111111111116', 'dine-in', 'pending', 2700, '22222222-2222-2222-2222-222222222224', true, 'Allergic to nuts', NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),

-- Takeout orders
('o1111111-1111-1111-1111-111111111116', 'w1111111-1111-1111-1111-111111111117', NULL, 'takeout', 'preparing', 3800, '22222222-2222-2222-2222-222222222222', true, 'Call when ready', NOW() - INTERVAL '20 minutes', NOW() - INTERVAL '18 minutes'),
('o1111111-1111-1111-1111-111111111117', 'w1111111-1111-1111-1111-111111111115', NULL, 'takeout', 'ready', 5200, '22222222-2222-2222-2222-222222222223', true, NULL, NOW() - INTERVAL '35 minutes', NOW() - INTERVAL '5 minutes');

-- ============================================
-- 7. ORDER ITEMS (Items in Each Order)
-- ============================================
INSERT INTO order_items (id, order_id, menu_item_id, quantity, unit_price, total_price, modifiers, created_at) VALUES
-- Order 1 items (completed)
('oi111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222221', 1, 1400, 1400, '{"size": "large"}', NOW() - INTERVAL '2 hours'),
('oi111111-1111-1111-1111-111111111112', 'o1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444445', 2, 300, 600, NULL, NOW() - INTERVAL '2 hours'),
('oi111111-1111-1111-1111-111111111113', 'o1111111-1111-1111-1111-111111111111', 'd4444444-4444-4444-4444-444444444442', 1, 450, 450, '{"milk": "oat"}', NOW() - INTERVAL '2 hours'),

-- Order 2 items (completed)
('oi111111-1111-1111-1111-111111111121', 'o1111111-1111-1111-1111-111111111112', 'b2222222-2222-2222-2222-222222222225', 1, 2200, 2200, '{"cooking": "medium"}', NOW() - INTERVAL '3 hours'),
('oi111111-1111-1111-1111-111111111122', 'o1111111-1111-1111-1111-111111111112', 'a1111111-1111-1111-1111-111111111113', 1, 950, 950, NULL, NOW() - INTERVAL '3 hours'),

-- Order 3 items (preparing)
('oi111111-1111-1111-1111-111111111131', 'o1111111-1111-1111-1111-111111111113', 'b2222222-2222-2222-2222-222222222223', 1, 1500, 1500, '{"spice": "mild"}', NOW() - INTERVAL '30 minutes'),
('oi111111-1111-1111-1111-111111111132', 'o1111111-1111-1111-1111-111111111113', 'd4444444-4444-4444-4444-444444444441', 1, 350, 350, NULL, NOW() - INTERVAL '30 minutes'),

-- Order 4 items (ready)
('oi111111-1111-1111-1111-111111111141', 'o1111111-1111-1111-1111-111111111114', 'b2222222-2222-2222-2222-222222222226', 1, 2800, 2800, '{"cooking": "rare"}', NOW() - INTERVAL '45 minutes'),
('oi111111-1111-1111-1111-111111111142', 'o1111111-1111-1111-1111-111111111114', 'a1111111-1111-1111-1111-111111111112', 1, 1200, 1200, NULL, NOW() - INTERVAL '45 minutes'),
('oi111111-1111-1111-1111-111111111143', 'o1111111-1111-1111-1111-111111111114', 'd4444444-4444-4444-4444-444444444447', 1, 800, 800, NULL, NOW() - INTERVAL '45 minutes'),

-- Order 5 items (pending)
('oi111111-1111-1111-1111-111111111151', 'o1111111-1111-1111-1111-111111111115', 'b2222222-2222-2222-2222-222222222227', 1, 1800, 1800, NULL, NOW() - INTERVAL '15 minutes'),
('oi111111-1111-1111-1111-111111111152', 'o1111111-1111-1111-1111-111111111115', 'c3333333-3333-3333-3333-333333333331', 1, 800, 800, NULL, NOW() - INTERVAL '15 minutes'),

-- Order 6 items (takeout - preparing)
('oi111111-1111-1111-1111-111111111161', 'o1111111-1111-1111-1111-111111111116', 'b2222222-2222-2222-2222-222222222222', 2, 1600, 3200, NULL, NOW() - INTERVAL '20 minutes'),
('oi111111-1111-1111-1111-111111111162', 'o1111111-1111-1111-1111-111111111116', 'd4444444-4444-4444-4444-444444444445', 2, 300, 600, NULL, NOW() - INTERVAL '20 minutes'),

-- Order 7 items (takeout - ready)
('oi111111-1111-1111-1111-111111111171', 'o1111111-1111-1111-1111-111111111117', 'b2222222-2222-2222-2222-222222222228', 2, 1650, 3300, NULL, NOW() - INTERVAL '35 minutes'),
('oi111111-1111-1111-1111-111111111172', 'o1111111-1111-1111-1111-111111111117', 'c3333333-3333-3333-3333-333333333333', 2, 900, 1800, NULL, NOW() - INTERVAL '35 minutes');

-- ============================================
-- 8. TRANSACTIONS (Wallet Transactions)
-- ============================================
INSERT INTO transactions (id, wallet_id, order_id, amount, transaction_type, description, created_at) VALUES
-- Voucher activations (credits)
('tx111111-1111-1111-1111-111111111111', 'w1111111-1111-1111-1111-111111111111', NULL, 5000, 'credit', 'Voucher activation: VOUCHER-5K-001', NOW() - INTERVAL '5 days'),
('tx111111-1111-1111-1111-111111111112', 'w1111111-1111-1111-1111-111111111112', NULL, 10000, 'credit', 'Voucher activation: VOUCHER-10K-001', NOW() - INTERVAL '3 days'),
('tx111111-1111-1111-1111-111111111113', 'w1111111-1111-1111-1111-111111111113', NULL, 2500, 'credit', 'Voucher activation: VOUCHER-2.5K-001', NOW() - INTERVAL '10 days'),
('tx111111-1111-1111-1111-111111111114', 'w1111111-1111-1111-1111-111111111114', NULL, 7500, 'credit', 'Voucher activation: VOUCHER-7.5K-001', NOW() - INTERVAL '2 days'),
('tx111111-1111-1111-1111-111111111115', 'w1111111-1111-1111-1111-111111111115', NULL, 15000, 'credit', 'Voucher activation: VOUCHER-15K-001', NOW() - INTERVAL '1 day'),

-- Direct top-ups
('tx111111-1111-1111-1111-111111111116', 'w1111111-1111-1111-1111-111111111116', NULL, 3500, 'credit', 'Direct wallet top-up', NOW() - INTERVAL '7 days'),
('tx111111-1111-1111-1111-111111111117', 'w1111111-1111-1111-1111-111111111117', NULL, 5200, 'credit', 'Direct wallet top-up', NOW() - INTERVAL '4 days'),

-- Order payments (debits)
('tx111111-1111-1111-1111-111111111121', 'w1111111-1111-1111-1111-111111111113', 'o1111111-1111-1111-1111-111111111111', -2500, 'debit', 'Payment for order #1', NOW() - INTERVAL '1 hour'),
('tx111111-1111-1111-1111-111111111122', 'w1111111-1111-1111-1111-111111111116', 'o1111111-1111-1111-1111-111111111112', -3200, 'debit', 'Payment for order #2', NOW() - INTERVAL '2 hours'),
('tx111111-1111-1111-1111-111111111123', 'w1111111-1111-1111-1111-111111111111', 'o1111111-1111-1111-1111-111111111113', -800, 'debit', 'Payment for order #3', NOW() - INTERVAL '25 minutes'),
('tx111111-1111-1111-1111-111111111124', 'w1111111-1111-1111-1111-111111111112', 'o1111111-1111-1111-1111-111111111114', -1500, 'debit', 'Payment for order #4', NOW() - INTERVAL '10 minutes'),
('tx111111-1111-1111-1111-111111111125', 'w1111111-1111-1111-1111-111111111114', 'o1111111-1111-1111-1111-111111111115', -700, 'debit', 'Payment for order #5', NOW() - INTERVAL '15 minutes'),
('tx111111-1111-1111-1111-111111111126', 'w1111111-1111-1111-1111-111111111117', 'o1111111-1111-1111-1111-111111111116', -3800, 'debit', 'Payment for order #6', NOW() - INTERVAL '18 minutes');

-- ============================================
-- 9. TABLE ASSIGNMENTS (Waiter Assignments)
-- ============================================
INSERT INTO table_assignments (id, table_id, waiter_id, assigned_by, notes, assigned_at, created_at) VALUES
('ta111111-1111-1111-1111-111111111111', 't1111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Regular customer', NOW() - INTERVAL '30 minutes', NOW() - INTERVAL '30 minutes'),
('ta111111-1111-1111-1111-111111111112', 't1111111-1111-1111-1111-111111111114', '22222222-2222-2222-2222-222222222223', '11111111-1111-1111-1111-111111111111', 'Large party', NOW() - INTERVAL '45 minutes', NOW() - INTERVAL '45 minutes'),
('ta111111-1111-1111-1111-111111111113', 't1111111-1111-1111-1111-111111111116', '22222222-2222-2222-2222-222222222224', '11111111-1111-1111-1111-111111111111', NULL, NOW() - INTERVAL '15 minutes', NOW() - INTERVAL '15 minutes'),
('ta111111-1111-1111-1111-111111111114', 't1111111-1111-1111-1111-111111111118', '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'VIP reservation', NOW(), NOW());

-- ============================================
-- 10. AUDIT LOG (Activity Logs)
-- ============================================
INSERT INTO audit_log (id, user_id, action, entity_type, entity_id, details, created_at) VALUES
-- User actions
('al111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'create', 'voucher', 'v1111111-1111-1111-1111-111111111111', '{"amount": 5000, "client_phone": "+1555000001"}', NOW() - INTERVAL '5 days'),
('al111111-1111-1111-1111-111111111112', '11111111-1111-1111-1111-111111111111', 'create', 'voucher', 'v1111111-1111-1111-1111-111111111112', '{"amount": 10000, "client_phone": "+1555000002"}', NOW() - INTERVAL '3 days'),

-- Order actions
('al111111-1111-1111-1111-111111111121', '22222222-2222-2222-2222-222222222222', 'create', 'order', 'o1111111-1111-1111-1111-111111111111', '{"table": 3, "total": 2500}', NOW() - INTERVAL '2 hours'),
('al111111-1111-1111-1111-111111111122', '33333333-3333-3333-3333-333333333333', 'update', 'order', 'o1111111-1111-1111-1111-111111111111', '{"status": "preparing"}', NOW() - INTERVAL '1 hour 45 minutes'),
('al111111-1111-1111-1111-111111111123', '33333333-3333-3333-3333-333333333333', 'update', 'order', 'o1111111-1111-1111-1111-111111111111', '{"status": "ready"}', NOW() - INTERVAL '1 hour 30 minutes'),
('al111111-1111-1111-1111-111111111124', '22222222-2222-2222-2222-222222222222', 'update', 'order', 'o1111111-1111-1111-1111-111111111111', '{"status": "completed"}', NOW() - INTERVAL '1 hour'),

-- Table assignments
('al111111-1111-1111-1111-111111111131', '11111111-1111-1111-1111-111111111111', 'assign', 'table', 't1111111-1111-1111-1111-111111111113', '{"waiter": "Sarah Williams", "table": 3}', NOW() - INTERVAL '30 minutes'),
('al111111-1111-1111-1111-111111111132', '11111111-1111-1111-1111-111111111111', 'assign', 'table', 't1111111-1111-1111-1111-111111111114', '{"waiter": "Mike Johnson", "table": 4}', NOW() - INTERVAL '45 minutes'),

-- Menu updates
('al111111-1111-1111-1111-111111111141', '11111111-1111-1111-1111-111111111111', 'update', 'menu_item', 'b2222222-2222-2222-2222-222222222225', '{"field": "price", "old": 2000, "new": 2200}', NOW() - INTERVAL '1 day'),
('al111111-1111-1111-1111-111111111142', '11111111-1111-1111-1111-111111111111', 'update', 'menu_item', 'a1111111-1111-1111-1111-111111111112', '{"field": "stock_quantity", "old": 35, "new": 30}', NOW() - INTERVAL '3 hours');

-- Update table current_order_id for occupied tables
UPDATE tables SET current_order_id = 'o1111111-1111-1111-1111-111111111113' WHERE id = 't1111111-1111-1111-1111-111111111113';
UPDATE tables SET current_order_id = 'o1111111-1111-1111-1111-111111111114' WHERE id = 't1111111-1111-1111-1111-111111111114';
UPDATE tables SET current_order_id = 'o1111111-1111-1111-1111-111111111115' WHERE id = 't1111111-1111-1111-1111-111111111116';

-- Success message
SELECT 'Dummy data seeded successfully!' as message,
       (SELECT COUNT(*) FROM users) as users_count,
       (SELECT COUNT(*) FROM menu_items) as menu_items_count,
       (SELECT COUNT(*) FROM tables) as tables_count,
       (SELECT COUNT(*) FROM wallets) as wallets_count,
       (SELECT COUNT(*) FROM vouchers) as vouchers_count,
       (SELECT COUNT(*) FROM orders) as orders_count,
       (SELECT COUNT(*) FROM order_items) as order_items_count,
       (SELECT COUNT(*) FROM transactions) as transactions_count,
       (SELECT COUNT(*) FROM table_assignments) as table_assignments_count,
       (SELECT COUNT(*) FROM audit_log) as audit_log_count;
