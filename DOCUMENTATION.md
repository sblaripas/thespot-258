# The Spot - Complete Documentation

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Features & Modules](#features--modules)
4. [User Manual](#user-manual)
5. [Staff Guide](#staff-guide)
6. [Technical Documentation](#technical-documentation)
7. [FAQ](#faq)
8. [Troubleshooting](#troubleshooting)

---

## Project Overview

### What is The Spot?

**The Spot** is a comprehensive digital management system designed for bars, restaurants, and entertainment venues. It provides a unified platform that integrates point-of-sale (POS), digital menus, inventory management, wallet systems, and QR-based ordering to streamline operations and enhance customer experience.

### Key Objectives

- **Digitalize Operations**: Replace traditional paper menus and manual order-taking with QR-based digital solutions
- **Inventory Control**: Track stock levels in real-time with automatic deductions and low-stock alerts
- **Customer Engagement**: Enable wallet-based payments and voucher systems for events
- **Staff Efficiency**: Provide intuitive POS and order management tools for waiters and bartenders
- **Business Intelligence**: Generate reports on sales, inventory, and staff performance

### Technology Stack

- **Frontend**: Next.js 16 (App Router), React 19.2, TypeScript
- **UI Framework**: Tailwind CSS v4, shadcn/ui components
- **Backend**: Supabase (PostgreSQL database, Authentication, Real-time subscriptions)
- **Deployment**: Vercel
- **Languages**: Bilingual support (Portuguese/English)

---

## System Architecture

### Multi-Tenancy Support

The Spot supports multiple restaurant locations or chains through a tenant-based architecture:

- **Tenants**: Each restaurant/location is a separate tenant with isolated data
- **Tenant Settings**: Customizable configurations per location (currency, tax rates, business hours)
- **Subscriptions**: Manage subscription plans and billing per tenant

### Database Schema

The system uses 18+ core tables organized into modules:

#### Core Tables
- **employees**: Staff members with roles and permissions
- **roles**: Role-based access control (Admin, Manager, Waiter, Bartender, Cashier)
- **tenants**: Restaurant locations/chains
- **tenant_settings**: Location-specific configurations

#### Menu & Orders
- **menu_items**: Food and beverage items with pricing and stock
- **categories**: Menu categories (Drinks, Food, Desserts, etc.)
- **orders**: Customer orders with status tracking
- **order_items**: Individual items within orders
- **tables**: Restaurant tables with QR codes and status

#### Inventory Management
- **inventory_items**: Raw materials and ingredients
- **item_components**: Composite items (e.g., cocktails with ingredients)
- **stock_adjustments**: Manual stock changes with reasons
- **inventory_counts**: Physical inventory audits
- **production_batches**: Pre-prepared items tracking
- **low_stock_alerts**: Automatic alerts for low inventory
- **suppliers**: Supplier information and contacts
- **purchase_orders**: Purchase order management

#### Wallet & Payments
- **wallets**: Customer digital wallets
- **vouchers**: Event vouchers and promotional codes
- **transactions**: Wallet transaction history
- **payments**: Payment records with multiple methods

#### Audit & Compliance
- **audit_log**: System-wide audit trail
- **discounts**: Discount tracking and approval
- **inventory_logs**: Inventory change history

---

## Features & Modules

### 1. Digital Menu (QR-Based)

**Path**: `/menu`

Customers scan QR codes on tables to access the digital menu.

**Features**:
- Browse menu items by category (Drinks, Food, Shots, Cocktails, etc.)
- View item details, prices, and availability
- Real-time stock updates (items become unavailable when out of stock)
- Add items to cart
- Submit orders directly from their phone
- Bilingual support (Portuguese/English)

**How It Works**:
1. Customer scans QR code on table
2. Digital menu opens with available items
3. Customer selects items and quantities
4. Order is sent to kitchen/bar
5. Staff receives notification

### 2. Point of Sale (POS)

**Path**: `/pos`

Staff-facing interface for taking orders at tables.

**Features**:
- Quick item selection with category filters
- Real-time stock availability
- Order modification (add/remove items)
- Table assignment
- Order notes and special requests
- Automatic inventory deduction
- Print receipts
- Multiple payment methods

**User Roles**:
- Waiters: Take orders, assign tables
- Bartenders: View drink orders
- Cashiers: Process payments

### 3. Inventory Management

**Path**: `/inventory`

Comprehensive inventory tracking and management system.

**Features**:

#### 3.1 Inventory Items
- Track stock levels for all items and ingredients
- Set minimum and maximum stock levels
- Automatic low-stock alerts
- Barcode/SKU tracking
- Unit cost and pricing
- Supplier information
- Composite items (e.g., cocktails with multiple ingredients)

#### 3.2 Stock Adjustments
- Manual stock adjustments with reasons:
  - Sales (automatic)
  - Waste/Spoilage
  - Theft/Loss
  - Received (purchase orders)
  - Transfer
  - Production
  - Correction
- Approval workflow for adjustments
- Audit trail for all changes

#### 3.3 Inventory Counts
- Physical inventory audits
- Barcode scanner support
- Variance tracking (expected vs. counted)
- Cycle counts and full counts
- Automatic stock reconciliation

#### 3.4 Production Batches
- Track pre-prepared items (e.g., sauces, marinades)
- Batch numbers and expiry dates
- Ingredient consumption tracking
- Production logs

#### 3.5 Low Stock Alerts
- Automatic alerts when stock reaches minimum levels
- Configurable alert thresholds per item
- Integration with POS (prevents overbooking)
- Integration with digital menu (hides unavailable items)
- Dashboard notifications for staff

#### 3.6 Purchase Orders
- Create purchase orders for suppliers
- Track order status (Draft, Sent, Received, Canceled)
- Automatic stock updates on receipt
- Cost tracking and budgeting

#### 3.7 Sales Reports
- Daily/weekly/monthly sales summaries
- Sales by item, category, employee
- Payment method breakdown
- Discount tracking
- Revenue analytics

#### 3.8 Inventory History
- Complete audit trail of all inventory changes
- Filter by date range, item, reason
- Export reports for compliance

### 4. Wallet System

**Path**: `/wallet`

Customer digital wallet for payments and vouchers.

**Features**:
- Phone number-based wallet access
- View wallet balance
- Transaction history
- Today's orders with status
- Pending orders requiring confirmation
- Canceled items with refunds
- Payment tracking
- QR code for quick access
- Voucher redemption

**How It Works**:
1. Customer enters phone number (e.g., 843992929)
2. System displays wallet balance and transactions
3. Customer can view orders, payments, and pending items
4. Orders are automatically deducted from wallet balance
5. Refunds are credited back to wallet

**Integration**:
- QR Events: Vouchers for event-based redemptions
- Digital Menu: Self-service orders via QR scan
- POS: Staff orders for occupied tables

### 5. Table Management

**Path**: `/tables`

Manage restaurant tables and assignments.

**Features**:
- View all tables with status (Available, Occupied, Reserved)
- QR code generation for each table
- Table assignments to waiters
- Current order tracking per table
- Occupancy duration tracking
- Table reservations

**Table Statuses**:
- **Available**: Ready for customers
- **Occupied**: Currently in use
- **Reserved**: Booked for future time
- **Cleaning**: Being prepared

### 6. Order Management

**Paths**: `/orders/live`, `/orders/track`, `/confirm-order`

Track and manage orders in real-time.

**Features**:

#### 6.1 Live Orders (`/orders/live`)
- Real-time order dashboard
- Filter by status (Pending, Preparing, Ready, Completed, Canceled)
- Order details with items and quantities
- Status updates
- Kitchen/bar notifications

#### 6.2 Order Tracking (`/orders/track`)
- Customer-facing order status
- Estimated preparation time
- Order history

#### 6.3 Order Confirmation (`/confirm-order`)
- Customer confirms order before submission
- Review items, quantities, and total
- Add special requests or notes
- Payment method selection

**Order Flow**:
1. **Pending**: Order received, awaiting preparation
2. **Preparing**: Kitchen/bar is preparing items
3. **Ready**: Order ready for pickup/delivery
4. **Completed**: Order delivered to customer
5. **Canceled**: Order canceled (with reason)

### 7. Staff Management

**Path**: `/staff`

Staff authentication and role management.

**Features**:
- Phone number + password authentication
- Role-based access control
- Staff profiles with contact information
- Shift management
- Performance tracking
- Activity logs

**Roles & Permissions**:
- **Admin**: Full system access, manage settings
- **Manager**: Inventory, reports, staff management
- **Waiter**: POS, table assignments, orders
- **Bartender**: View drink orders, inventory alerts
- **Cashier**: Process payments, view orders
- **Teller**: Wallet management, voucher redemption

**Default Credentials**:
- Tellers: Phone `843992929`, Password `teller123`
- Staff: Phone `823992929`, Password `staff123`
- Admins: Phone `873992929`, Password `admin123`

### 8. Admin Dashboard

**Path**: `/admin`

Administrative interface for system management.

**Features**:
- System overview and statistics
- User management
- Menu item management
- Inventory settings
- Reports and analytics
- Audit logs
- System settings

### 9. QR Code System

QR codes are used throughout the system for:

**Table QR Codes**:
- Each table has a unique QR code
- Scanning opens digital menu for that table
- Orders are automatically assigned to the table

**Voucher QR Codes**:
- Event vouchers with QR codes
- Scan to redeem voucher amount
- Automatic wallet credit

**Wallet QR Codes**:
- Quick access to customer wallet
- Display at checkout for payment

### 10. Waiter Orders

**Path**: `/waiter/orders`

Waiter-specific order management interface.

**Features**:
- View assigned tables
- Active orders for assigned tables
- Quick order status updates
- Table turnover tracking
- Tips and payment collection

---

## User Manual

### For Customers

#### Accessing the Digital Menu

1. **Scan QR Code**: Use your phone camera to scan the QR code on your table
2. **Browse Menu**: The digital menu will open automatically
3. **Select Items**: Tap on items to view details and add to cart
4. **Review Cart**: Check your selections and quantities
5. **Submit Order**: Confirm your order
6. **Track Status**: Monitor your order status in real-time

#### Using Your Wallet

1. **Access Wallet**: Navigate to `/wallet` or scan your wallet QR code
2. **Enter Phone Number**: Input your phone number (e.g., 843992929)
3. **View Balance**: See your current wallet balance
4. **Check Orders**: View today's orders, pending items, and canceled orders
5. **Transaction History**: Review all wallet transactions

#### Redeeming Vouchers

1. **Receive Voucher**: Get voucher QR code from event or promotion
2. **Scan Voucher**: Scan the voucher QR code
3. **Automatic Credit**: Voucher amount is credited to your wallet
4. **Use Balance**: Use wallet balance for orders

### For Staff

#### Logging In

1. **Navigate to Login**: Go to `/staff` or `/auth/login`
2. **Enter Phone Number**: Input your staff phone number
3. **Enter Password**: Input your password
4. **Access Dashboard**: You'll be redirected based on your role

#### Taking Orders (POS)

1. **Select Table**: Choose the table number
2. **Browse Menu**: Use category filters to find items
3. **Add Items**: Tap items to add to order
4. **Adjust Quantities**: Use +/- buttons to modify quantities
5. **Add Notes**: Include special requests or modifications
6. **Submit Order**: Send order to kitchen/bar
7. **Process Payment**: Select payment method and complete transaction

#### Managing Inventory

1. **Access Inventory**: Navigate to `/inventory`
2. **View Items**: Browse all inventory items
3. **Check Stock Levels**: Monitor current stock and alerts
4. **Adjust Stock**: Make manual adjustments with reasons
5. **Conduct Counts**: Perform physical inventory counts
6. **Generate Reports**: View sales and inventory reports

#### Managing Tables

1. **View Tables**: Navigate to `/tables`
2. **Check Status**: See which tables are available/occupied
3. **Assign Waiter**: Assign tables to specific waiters
4. **Track Orders**: Monitor active orders per table
5. **Update Status**: Change table status as needed

---

## Staff Guide

### Waiter Workflow

**Morning Setup**:
1. Log in to staff portal
2. Check assigned tables
3. Review menu items and availability
4. Note any special promotions

**Taking Orders**:
1. Greet customers at table
2. Open POS system
3. Select table number
4. Take order using POS interface
5. Confirm order with customer
6. Submit to kitchen/bar

**During Service**:
1. Monitor order status
2. Deliver orders when ready
3. Check on customer satisfaction
4. Process additional orders

**Closing Table**:
1. Present bill to customer
2. Process payment
3. Update table status to "Available"
4. Clean and prepare for next customer

### Bartender Workflow

**Opening Shift**:
1. Log in to system
2. Check inventory levels
3. Review low-stock alerts
4. Prepare bar setup

**During Service**:
1. Monitor incoming drink orders
2. Prepare drinks in order sequence
3. Update order status to "Ready"
4. Alert waiters for pickup

**Inventory Management**:
1. Note items running low
2. Create stock adjustments for waste
3. Report issues to manager

**Closing Shift**:
1. Conduct inventory count
2. Record any discrepancies
3. Clean and secure bar area

### Manager Workflow

**Daily Tasks**:
1. Review sales reports
2. Check inventory levels
3. Approve stock adjustments
4. Monitor staff performance

**Weekly Tasks**:
1. Generate weekly sales reports
2. Review inventory turnover
3. Create purchase orders
4. Schedule staff shifts

**Monthly Tasks**:
1. Conduct full inventory count
2. Analyze sales trends
3. Review supplier performance
4. Update menu pricing

---

## Technical Documentation

### Authentication System

**Method**: Phone number + Password authentication

**Flow**:
1. User enters phone number and password
2. System queries `users` table for matching credentials
3. Password is verified (stored as plain text for demo - should be hashed in production)
4. User session is stored in localStorage
5. Role-based redirect to appropriate dashboard

**Session Management**:
- Sessions stored in localStorage as JSON
- Session includes: user ID, phone, name, role
- Session persists across page refreshes
- Logout clears localStorage

**Security Considerations** (Production Recommendations):
- Implement password hashing (bcrypt, argon2)
- Use JWT tokens instead of localStorage
- Add rate limiting for login attempts
- Implement session expiration
- Add two-factor authentication

### Database Schema Details

#### Users/Employees Table

\`\`\`sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL,
  password VARCHAR(255),
  otp VARCHAR(6),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

**Roles**:
- `admin`: Full system access
- `manager`: Inventory and reports
- `waiter`: POS and orders
- `bartender`: Drink orders and inventory
- `cashier`: Payment processing
- `teller`: Wallet management

#### Menu Items Table

\`\`\`sql
CREATE TABLE menu_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  price INTEGER NOT NULL,
  stock_quantity INTEGER DEFAULT 0,
  min_stock_alert INTEGER DEFAULT 5,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

**Categories**:
- Drinks
- Food
- Shots
- Cocktails
- Desserts
- Appetizers

#### Orders Table

\`\`\`sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  table_id UUID REFERENCES tables(id),
  wallet_id UUID REFERENCES wallets(id),
  staff_id UUID REFERENCES users(id),
  order_type VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  total_amount INTEGER NOT NULL,
  notes TEXT,
  client_confirmed BOOLEAN DEFAULT false,
  voucher_qr VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

**Order Types**:
- `dine-in`: Table service
- `takeout`: Pickup orders
- `delivery`: Delivery orders
- `qr-scan`: Self-service via QR

**Order Statuses**:
- `pending`: Awaiting preparation
- `preparing`: Being prepared
- `ready`: Ready for pickup/delivery
- `completed`: Delivered to customer
- `canceled`: Canceled order

#### Inventory Items Table

\`\`\`sql
CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  sku VARCHAR(50) UNIQUE,
  barcode VARCHAR(50),
  unit VARCHAR(20) NOT NULL,
  current_stock NUMERIC(10,2) DEFAULT 0,
  min_stock_level NUMERIC(10,2) DEFAULT 0,
  max_stock_level NUMERIC(10,2),
  unit_cost NUMERIC(10,2),
  supplier VARCHAR(100),
  is_composite BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

**Units**:
- kg (kilograms)
- L (liters)
- units (individual items)
- ml (milliliters)
- g (grams)

#### Wallets Table

\`\`\`sql
CREATE TABLE wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_phone VARCHAR(20) UNIQUE NOT NULL,
  balance INTEGER DEFAULT 0,
  voucher_id UUID REFERENCES vouchers(id),
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
\`\`\`

### API Endpoints (Supabase Queries)

All data access is through Supabase client queries:

#### Fetch Menu Items
\`\`\`typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('is_available', true)
  .order('category', { ascending: true });
\`\`\`

#### Create Order
\`\`\`typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    table_id: tableId,
    staff_id: staffId,
    order_type: 'dine-in',
    status: 'pending',
    total_amount: total,
    notes: notes
  })
  .select()
  .single();
\`\`\`

#### Update Inventory
\`\`\`typescript
const { data, error } = await supabase
  .from('inventory_items')
  .update({ current_stock: newStock })
  .eq('id', itemId);
\`\`\`

#### Fetch Wallet Data
\`\`\`typescript
const { data, error } = await supabase
  .from('wallets')
  .select(`
    *,
    transactions(*),
    orders(*, order_items(*, menu_items(*)))
  `)
  .eq('client_phone', phone)
  .single();
\`\`\`

### Row Level Security (RLS)

RLS policies are implemented for data security:

**Public Access**:
- Menu items (read-only)
- Wallets (by phone number)

**Authenticated Access**:
- Orders (staff only)
- Inventory (manager/admin only)
- Users (admin only)

**Example RLS Policy**:
\`\`\`sql
-- Allow public read access to menu items
CREATE POLICY "Public can view menu items"
ON menu_items FOR SELECT
USING (is_available = true);

-- Allow staff to create orders
CREATE POLICY "Staff can create orders"
ON orders FOR INSERT
WITH CHECK (true);
\`\`\`

### Real-Time Features

Supabase real-time subscriptions are used for:

**Live Orders**:
\`\`\`typescript
const subscription = supabase
  .channel('orders')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'orders' },
    (payload) => {
      // Update UI with new order data
    }
  )
  .subscribe();
\`\`\`

**Inventory Alerts**:
\`\`\`typescript
const subscription = supabase
  .channel('low_stock_alerts')
  .on('postgres_changes',
    { event: 'INSERT', schema: 'public', table: 'low_stock_alerts' },
    (payload) => {
      // Show notification to staff
    }
  )
  .subscribe();
\`\`\`

---

## FAQ

### General Questions

**Q: What is The Spot?**
A: The Spot is a comprehensive digital management system for bars, restaurants, and entertainment venues that integrates POS, digital menus, inventory management, and wallet systems.

**Q: Do I need to install an app?**
A: No, The Spot is a web-based application accessible through any modern web browser on phones, tablets, or computers.

**Q: Is internet connection required?**
A: Yes, an active internet connection is required for real-time updates and data synchronization.

**Q: What languages are supported?**
A: The system supports Portuguese and English with easy language switching.

### For Customers

**Q: How do I access the digital menu?**
A: Simply scan the QR code on your table using your phone's camera. The menu will open automatically.

**Q: Can I modify my order after submitting?**
A: Contact your waiter immediately. Orders can be modified before they enter the "Preparing" status.

**Q: How do I check my wallet balance?**
A: Navigate to `/wallet` and enter your phone number to view your balance and transaction history.

**Q: What payment methods are accepted?**
A: Cash, card, mobile money (M-Pesa, e-Mola), Multicaixa, and wallet balance.

**Q: How do I redeem a voucher?**
A: Scan the voucher QR code, and the amount will be automatically credited to your wallet.

**Q: Can I see my order history?**
A: Yes, access your wallet and navigate to the "Orders" tab to see all your orders.

### For Staff

**Q: I forgot my password. How do I reset it?**
A: Contact your manager or system administrator to reset your password.

**Q: How do I handle a canceled order?**
A: In the POS or order management system, select the order and change status to "Canceled". Add a reason for the cancellation.

**Q: What do I do when an item is out of stock?**
A: Update the item's stock quantity to 0 in the inventory system. It will automatically become unavailable in the menu.

**Q: How do I process a refund?**
A: Cancel the order item and select "Refund to Wallet". The amount will be credited back to the customer's wallet.

**Q: Can I view orders from other waiters?**
A: Waiters can only view orders for their assigned tables. Managers and admins can view all orders.

**Q: How do I conduct an inventory count?**
A: Navigate to Inventory > Inventory Counts > New Count. Scan items or manually enter counted quantities.

### Technical Questions

**Q: What browsers are supported?**
A: Chrome, Firefox, Safari, and Edge (latest versions). Mobile browsers are fully supported.

**Q: Is my data secure?**
A: Yes, all data is encrypted in transit and at rest. Row-level security policies ensure data isolation.

**Q: Can I export reports?**
A: Yes, reports can be exported in CSV, PDF, and Excel formats.

**Q: How often is data backed up?**
A: Supabase provides automatic daily backups with point-in-time recovery.

**Q: Can I integrate with my existing POS system?**
A: The Spot is a standalone system, but API integration is possible for custom implementations.

---

## Troubleshooting

### Common Issues

#### Issue: "Infinite recursion detected in policy for relation 'users'"

**Cause**: Row Level Security (RLS) policy circular dependency

**Solution**:
1. Run the fix script: `scripts/012_fix_rls_infinite_recursion.sql`
2. This disables RLS on the old `users` table and simplifies wallet policies

#### Issue: Menu items not showing

**Possible Causes**:
- Items marked as unavailable
- Stock quantity is 0
- Database connection issue

**Solutions**:
1. Check item availability in admin panel
2. Verify stock quantities in inventory
3. Check browser console for errors
4. Refresh the page

#### Issue: Orders not appearing in POS

**Possible Causes**:
- Real-time subscription not connected
- Browser cache issue
- Network connectivity

**Solutions**:
1. Refresh the page
2. Clear browser cache
3. Check internet connection
4. Verify Supabase connection status

#### Issue: Wallet balance not updating

**Possible Causes**:
- Transaction not completed
- Database sync delay
- RLS policy blocking access

**Solutions**:
1. Wait a few seconds and refresh
2. Check transaction history for pending transactions
3. Verify phone number is correct
4. Contact support if issue persists

#### Issue: Cannot log in as staff

**Possible Causes**:
- Incorrect phone number or password
- Account not created
- Session storage issue

**Solutions**:
1. Verify phone number format (no spaces or dashes)
2. Check password (case-sensitive)
3. Clear browser localStorage
4. Contact admin to verify account exists

#### Issue: Low stock alerts not showing

**Possible Causes**:
- Alert threshold not configured
- Alerts already acknowledged
- Real-time subscription not active

**Solutions**:
1. Check inventory item min_stock_level settings
2. Navigate to Inventory > Alerts to view all alerts
3. Refresh the page to reconnect real-time subscription

#### Issue: QR code not scanning

**Possible Causes**:
- Poor lighting
- Camera permissions denied
- QR code damaged or unclear

**Solutions**:
1. Ensure good lighting on QR code
2. Grant camera permissions in browser
3. Try a different QR code scanner app
4. Manually enter table number if available

### Error Messages

#### "Failed to fetch wallet data"

**Meaning**: Unable to retrieve wallet information from database

**Actions**:
1. Check internet connection
2. Verify phone number is correct
3. Ensure wallet exists for that phone number
4. Check browser console for detailed error

#### "Insufficient stock"

**Meaning**: Not enough inventory to fulfill order

**Actions**:
1. Check inventory levels
2. Adjust order quantity
3. Select alternative items
4. Notify manager to restock

#### "Order confirmation required"

**Meaning**: Customer must confirm order before processing

**Actions**:
1. Review order details
2. Confirm items and quantities are correct
3. Click "Confirm Order" button
4. Wait for order to be submitted

#### "Payment failed"

**Meaning**: Payment transaction could not be completed

**Actions**:
1. Verify payment method details
2. Check wallet balance if using wallet
3. Try alternative payment method
4. Contact support if issue persists

### Performance Issues

#### Slow page loading

**Solutions**:
1. Check internet connection speed
2. Clear browser cache
3. Close unnecessary browser tabs
4. Use a modern browser (Chrome, Firefox, Safari)

#### Real-time updates delayed

**Solutions**:
1. Refresh the page
2. Check network stability
3. Verify Supabase status
4. Contact support if persistent

---

## Support & Contact

### Getting Help

**For Customers**:
- Ask your waiter for assistance
- Contact venue staff
- Check FAQ section above

**For Staff**:
- Contact your manager
- Check this documentation
- Review training materials

**For Technical Issues**:
- Check Troubleshooting section
- Review browser console errors
- Contact system administrator

### System Administrator

**Responsibilities**:
- User account management
- System configuration
- Database maintenance
- Troubleshooting technical issues
- Training staff

**Contact**: [Your contact information here]

---

## Appendix

### Keyboard Shortcuts

**POS System**:
- `Ctrl + N`: New order
- `Ctrl + S`: Submit order
- `Ctrl + F`: Search items
- `Esc`: Clear selection

**Inventory**:
- `Ctrl + A`: Add new item
- `Ctrl + E`: Edit selected item
- `Ctrl + D`: Delete selected item

### Default Test Data

**Test Wallets**:
- Phone: `843992929` (Teller account)
- Phone: `823992929` (Staff account)
- Phone: `873992929` (Admin account)

**Test Tables**:
- Table 1-10 with QR codes

**Test Menu Items**:
- Various drinks, food, shots, and cocktails
- Stock quantities and pricing

### Database Maintenance

**Regular Tasks**:
- Daily: Review audit logs
- Weekly: Backup database
- Monthly: Archive old orders
- Quarterly: Optimize database performance

**Backup Procedures**:
1. Supabase provides automatic backups
2. Export critical data monthly
3. Test restore procedures quarterly

### Version History

**v1.0.0** (Current)
- Initial release
- Core POS functionality
- Digital menu with QR codes
- Inventory management
- Wallet system
- Staff authentication
- Multi-language support

**Planned Features**:
- Mobile app (iOS/Android)
- Advanced analytics dashboard
- Customer loyalty program
- Online reservations
- Integration with delivery platforms
- Multi-currency support

---

## License & Credits

**The Spot** - Digital Restaurant Management System

Built with:
- Next.js 16
- React 19.2
- Supabase
- Tailwind CSS v4
- shadcn/ui

**Copyright** © 2025 The Spot. All rights reserved.

---

*Last Updated: January 2025*
*Documentation Version: 1.0.0*
