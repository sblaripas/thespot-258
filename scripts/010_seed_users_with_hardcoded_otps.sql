-- Seed users table with hardcoded OTPs for testing
-- Each user has a unique phone number and permanent OTP

-- Clear existing users (optional - comment out if you want to keep existing data)
-- DELETE FROM users;

-- Insert test users with hardcoded OTPs
INSERT INTO users (id, phone, otp, name, role, created_at, updated_at)
VALUES
  -- Admin users
  (gen_random_uuid(), '+258840000001', '111111', 'Admin User', 'admin', NOW(), NOW()),
  (gen_random_uuid(), '+258840000002', '222222', 'Manager User', 'admin', NOW(), NOW()),
  
  -- Waiter users
  (gen_random_uuid(), '+258841000001', '333333', 'Waiter João', 'waiter', NOW(), NOW()),
  (gen_random_uuid(), '+258841000002', '444444', 'Waiter Maria', 'waiter', NOW(), NOW()),
  (gen_random_uuid(), '+258841000003', '555555', 'Waiter Pedro', 'waiter', NOW(), NOW()),
  
  -- Barman users
  (gen_random_uuid(), '+258842000001', '666666', 'Barman Carlos', 'barman', NOW(), NOW()),
  (gen_random_uuid(), '+258842000002', '777777', 'Barman Ana', 'barman', NOW(), NOW()),
  
  -- Customer users
  (gen_random_uuid(), '+258843000001', '888888', 'Customer Alice', 'customer', NOW(), NOW()),
  (gen_random_uuid(), '+258843000002', '999999', 'Customer Bob', 'customer', NOW(), NOW()),
  (gen_random_uuid(), '+258843000003', '123456', 'Customer Charlie', 'customer', NOW(), NOW())
ON CONFLICT (phone) DO UPDATE SET
  otp = EXCLUDED.otp,
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  updated_at = NOW();

-- Display the created users for reference
SELECT phone, otp, name, role FROM users ORDER BY role, phone;
