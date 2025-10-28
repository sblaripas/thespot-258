# RestaurantOS - Complete Documentation

## Table of Contents
1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [Features](#features)
4. [User Interfaces](#user-interfaces)
5. [Database Schema](#database-schema)
6. [Installation & Setup](#installation--setup)
7. [User Manuals](#user-manuals)
8. [Technical Specifications](#technical-specifications)
9. [Security & Access Control](#security--access-control)
10. [Multi-Language Support](#multi-language-support)

---

## Overview

**RestaurantOS** is a comprehensive, multi-tenant Point of Sale (POS) system specifically designed for restaurants in Mozambique. The system provides a complete restaurant management solution with four specialized interfaces optimized for different user roles and devices.

### Key Characteristics
- **Multi-Tenant Architecture**: Supports multiple restaurants in a single deployment
- **Multi-Device Support**: Optimized interfaces for mobile phones, tablets, kiosks, and desktop computers
- **Multi-Language**: Full support for Portuguese and English
- **Cloud-Based**: Built on Lovable Cloud (Supabase) for reliability and scalability
- **Real-Time**: Order updates and table status synchronization across all devices
- **Offline-Ready**: Designed to handle intermittent connectivity (future enhancement)

### Target Markets
- Full-service restaurants
- Quick-service restaurants (QSR)
- Cafes and coffee shops
- Food courts
- Hotel restaurants
- Catering services

---

## System Architecture

### Technology Stack

**Frontend**
- **Framework**: React 18.3+ with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v6
- **UI Components**: shadcn/ui with Radix UI primitives
- **Styling**: Tailwind CSS with custom design system
- **State Management**: TanStack Query (React Query) for server state
- **Icons**: Lucide React

**Backend (Lovable Cloud)**
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth (not yet implemented)
- **Real-time**: Supabase Realtime subscriptions
- **File Storage**: Supabase Storage for menu images
- **API**: Auto-generated REST and GraphQL APIs

**DevOps**
- **Hosting**: Lovable deployment platform
- **Version Control**: Git with automated deployments
- **CI/CD**: Automatic deployment on git push

### System Components

```
┌─────────────────────────────────────────────────────┐
│                   RestaurantOS                       │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐   │
│  │  Mobile    │  │  Tablet    │  │   Kiosk    │   │
│  │  Customer  │  │  Waiter    │  │ Self-Order │   │
│  └────────────┘  └────────────┘  └────────────┘   │
│                                                      │
│  ┌────────────────────────────────────────────┐    │
│  │         Staff Dashboard (Desktop)           │    │
│  └────────────────────────────────────────────┘    │
│                                                      │
├─────────────────────────────────────────────────────┤
│              Application Layer (React)               │
├─────────────────────────────────────────────────────┤
│          Lovable Cloud / Supabase Backend           │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐   │
│  │ Database │ │   Auth   │ │  Real-time Sync  │   │
│  └──────────┘ └──────────┘ └──────────────────┘   │
└─────────────────────────────────────────────────────┘
```

---

## Features

### 1. Multi-Interface Design

#### Mobile Customer Interface (`/mobile`)
- Browse menu with categories
- Search menu items by name
- View item details, prices, and images
- Add items to shopping cart
- Adjust quantities
- View cart total in real-time
- Multi-language menu display

#### Tablet Waiter Interface (`/tablet`)
- Table management dashboard
- View all tables with real-time status (Available, Occupied, Reserved, Cleaning)
- Table capacity and current guest count
- Active orders list with status tracking
- Order details view
- Quick actions (New Order, View Details, Cancel)
- Order timing and amount tracking

#### Kiosk Self-Service (`/kiosk`)
- Touch-optimized interface
- Self-service ordering
- Payment integration
- Order confirmation and receipt printing
- Large, accessible UI elements

#### Staff Dashboard (`/staff`)
- Real-time business metrics
- Sales overview (daily, weekly, monthly)
- Active tables count
- Online staff monitoring
- Recent orders tracking
- Top-selling menu items analytics
- Revenue reporting by item

### 2. Menu Management

#### Categories
- Hierarchical category structure
- Multi-language category names
- Category-based filtering
- Display order control
- Active/inactive status

#### Menu Items
- Comprehensive item details (name, description, price)
- Multi-language support for names and descriptions
- Image upload and display
- Allergen information tracking
- Preparation time estimates
- Cost tracking for profit analysis
- Inventory integration

### 3. Order Management

#### Order Processing
- Order creation and modification
- Item-level customization
- Special instructions and notes
- Order status workflow:
  - Pending → Confirmed → Preparing → Ready → Completed
- Order timing and duration tracking
- Multi-item orders with quantities

#### Table Management
- Table assignments and reservations
- Table status management
- Capacity planning
- Guest count tracking
- Table turnover optimization

### 4. Payment Processing

#### Payment Methods
- Cash payments with change calculation
- Card payments (future: POS terminal integration)
- Mobile money (M-Pesa, e-Mola)
- Split payments
- Tips and gratuity handling

#### Financial Tracking
- Transaction ID generation
- Payment status tracking
- Receipt generation
- Daily sales reconciliation
- Cash drawer management per shift

### 5. Staff & Access Management

#### Employee Management
- Employee profiles with contact information
- PIN-based authentication for POS access
- Role-based permissions
- Shift scheduling
- Last login tracking
- Language preferences

#### Role System
- Admin: Full system access
- Manager: Operations and reporting
- Waiter: Order and table management
- Cashier: Payment processing
- Kitchen: Order viewing and status updates
- Host: Reservation and table management

### 6. Inventory Management

#### Stock Tracking
- Real-time inventory levels
- Low stock alerts
- Automatic deduction on sales
- Manual adjustments with reason codes
- Waste and spoilage tracking

#### Inventory Logs
- Complete audit trail
- Movement types: Sale, Purchase, Adjustment, Waste
- Cost impact calculations
- Employee accountability
- Date and time stamping

### 7. Reservation System

#### Table Reservations
- Customer information capture (name, email, phone)
- Party size and preferred seating
- Date and time selection
- Special requests and notes
- Reservation status management
- Confirmation notifications (future)

### 8. Reporting & Analytics

#### Sales Reports
- Daily, weekly, monthly, yearly views
- Revenue by category
- Top-selling items
- Average order value
- Peak hours analysis

#### Operational Reports
- Table turnover rates
- Order fulfillment times
- Staff performance metrics
- Inventory usage
- Waste analysis

### 9. Multi-Tenant Support

#### Tenant Management
- Restaurant profile management
- Business information (name, address, contact)
- Province/location support across Mozambique
- Timezone and currency settings
- Subscription tiers (Basic, Professional, Enterprise)

#### Tenant Settings
- Tax configuration (IVA rates for Mozambique)
- Operating hours
- Language preferences
- Receipt templates
- Table auto-status rules
- Order timeout settings

---

## User Interfaces

### Landing Page (`/`)

The main landing page allows users to select their interface:

**Navigation Cards:**
1. **Mobile Customer** → `/mobile`
   - Icon: Smartphone
   - For: Customers browsing menu on their phones
   
2. **Tablet Waiter** → `/tablet`
   - Icon: Tablet
   - For: Waitstaff managing tables and orders
   
3. **Kiosk** → `/kiosk`
   - Icon: Monitor
   - For: Self-service ordering stations
   
4. **Staff Dashboard** → `/staff`
   - Icon: Layout Dashboard
   - For: Management and reporting

**Features:**
- Language toggle (PT/EN)
- Responsive grid layout
- Visual gradient styling for each interface
- Footer with system information

---

## Database Schema

### Core Tables

#### `tenants`
Restaurant/business information for multi-tenant architecture.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| name | TEXT | Restaurant name |
| subdomain | TEXT | Unique subdomain identifier |
| email | TEXT | Contact email |
| phone | TEXT | Contact phone |
| address | TEXT | Physical address |
| province | TEXT | Mozambique province |
| subscription_tier | TEXT | Subscription level |
| created_at | TIMESTAMP | Creation timestamp |
| updated_at | TIMESTAMP | Last update timestamp |

#### `employees`
Staff members with authentication and role assignments.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| first_name | TEXT | Employee first name |
| last_name | TEXT | Employee last name |
| email | TEXT | Contact email |
| phone | TEXT | Contact phone |
| role_id | UUID | Role reference |
| pin_hash | TEXT | Hashed PIN for POS login |
| is_active | BOOLEAN | Active status |
| language_preference | TEXT | Preferred language |
| last_login | TIMESTAMP | Last login time |

#### `roles`
Permission templates for access control.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| name | TEXT | Role name |
| can_manage_orders | BOOLEAN | Order management permission |
| can_manage_menu | BOOLEAN | Menu editing permission |
| can_manage_inventory | BOOLEAN | Inventory control permission |
| can_manage_employees | BOOLEAN | Staff management permission |
| can_view_reports | BOOLEAN | Reporting access permission |

#### `categories`
Menu organization structure.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| name | TEXT | Category name |
| name_en | TEXT | English translation |
| display_order | INTEGER | Sort order |
| is_active | BOOLEAN | Active status |

#### `menu_items`
Individual menu items with pricing and details.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| category_id | UUID | Category reference |
| name | TEXT | Item name |
| name_en | TEXT | English translation |
| description | TEXT | Item description |
| description_en | TEXT | English translation |
| price | DECIMAL | Selling price |
| cost | DECIMAL | Cost price |
| image_url | TEXT | Product image |
| is_available | BOOLEAN | Availability status |
| preparation_time | INTEGER | Prep time in minutes |
| allergens | TEXT[] | Allergen list |
| current_stock | INTEGER | Available quantity |
| low_stock_threshold | INTEGER | Reorder alert level |

#### `restaurant_tables`
Physical table management.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| table_number | TEXT | Table identifier |
| capacity | INTEGER | Maximum seats |
| status | TEXT | Current status |
| current_guests | INTEGER | Current occupancy |
| is_active | BOOLEAN | Active status |

#### `table_reservations`
Customer reservation management.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| table_id | UUID | Table reference |
| customer_name | TEXT | Guest name |
| customer_email | TEXT | Contact email |
| customer_phone | TEXT | Contact phone |
| party_size | INTEGER | Number of guests |
| reservation_date | DATE | Reservation date |
| reservation_time | TIME | Reservation time |
| status | TEXT | Reservation status |
| special_requests | TEXT | Notes and requests |

#### `orders`
Customer orders and transactions.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| table_id | UUID | Table reference |
| employee_id | UUID | Waiter reference |
| order_number | TEXT | Display order number |
| status | TEXT | Order status |
| subtotal | DECIMAL | Items total |
| tax_amount | DECIMAL | Tax calculated |
| total_amount | DECIMAL | Final total |
| notes | TEXT | Special instructions |
| created_at | TIMESTAMP | Order time |
| completed_at | TIMESTAMP | Completion time |

#### `order_items`
Individual items within orders.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| order_id | UUID | Order reference |
| menu_item_id | UUID | Menu item reference |
| quantity | INTEGER | Quantity ordered |
| unit_price | DECIMAL | Price at order time |
| subtotal | DECIMAL | Item subtotal |
| special_instructions | TEXT | Customization notes |
| status | TEXT | Preparation status |

#### `payments`
Payment transactions and records.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| order_id | UUID | Order reference |
| employee_id | UUID | Cashier reference |
| payment_method | TEXT | Payment type |
| amount | DECIMAL | Payment amount |
| tip_amount | DECIMAL | Gratuity amount |
| transaction_id | TEXT | External transaction ID |
| card_last_four | TEXT | Masked card number |
| payment_status | TEXT | Payment status |
| cash_received | DECIMAL | Cash amount received |
| change_given | DECIMAL | Change returned |

#### `inventory_logs`
Stock movement audit trail.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| menu_item_id | UUID | Item reference |
| movement_type | TEXT | Sale/Purchase/Adjustment/Waste |
| quantity_change | INTEGER | Quantity delta |
| cost_impact | DECIMAL | Financial impact |
| reason | TEXT | Adjustment reason |
| employee_id | UUID | Responsible employee |

#### `shifts`
Cash drawer and shift management.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| employee_id | UUID | Employee reference |
| shift_date | DATE | Shift date |
| start_time | TIMESTAMP | Shift start |
| end_time | TIMESTAMP | Shift end |
| opening_cash | DECIMAL | Starting cash balance |
| closing_cash | DECIMAL | Ending cash balance |
| expected_cash | DECIMAL | Calculated cash |
| cash_difference | DECIMAL | Over/under amount |
| total_sales | DECIMAL | Shift sales total |
| transaction_count | INTEGER | Number of transactions |

#### `tenant_settings`
Restaurant-specific configuration.

| Column | Type | Description |
|--------|------|-------------|
| id | UUID | Primary key |
| tenant_id | UUID | Restaurant reference |
| tax_rate | DECIMAL | IVA tax percentage |
| currency | TEXT | Currency code (MZN) |
| timezone | TEXT | Timezone setting |
| default_language | TEXT | System language |
| receipt_header | TEXT | Receipt template header |
| receipt_footer | TEXT | Receipt template footer |
| table_timeout_minutes | INTEGER | Auto-cleanup timer |
| enable_reservations | BOOLEAN | Reservation feature toggle |
| opening_time | TIME | Business opening time |
| closing_time | TIME | Business closing time |

---

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Lovable account (for deployment)

### Local Development Setup

```bash
# Clone the repository
git clone <YOUR_GIT_URL>
cd RestaurantOS

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Configuration

The `.env` file is auto-configured by Lovable Cloud and contains:
```
VITE_SUPABASE_URL=<your-supabase-url>
VITE_SUPABASE_PUBLISHABLE_KEY=<your-anon-key>
VITE_SUPABASE_PROJECT_ID=<your-project-id>
```

**Important**: Never edit the `.env` file manually. It's automatically managed by the Lovable Cloud integration.

### Database Setup

The database schema is managed through Supabase migrations in `supabase/migrations/`. The initial schema includes all tables, indexes, and triggers.

To apply migrations (handled automatically in Lovable):
```bash
# Migrations are auto-deployed when approved in Lovable
```

### Deployment

The application deploys automatically through Lovable:
1. Click "Publish" in the Lovable editor
2. Your app will be live at `https://[your-subdomain].lovable.app`
3. Connect a custom domain in Project Settings > Domains (requires paid plan)

---

## User Manuals

### Mobile Customer Interface

#### Accessing the Menu
1. Navigate to `/mobile` or select "Mobile Customer" from the landing page
2. The menu displays with all available items organized by categories

#### Browsing Menu Items
- **View Categories**: Scroll through category buttons at the top
- **Filter by Category**: Tap a category button to see only items in that category
- **View All Items**: Tap "All" to see the complete menu
- **Search Items**: Use the search bar at the top to find items by name

#### Adding Items to Cart
1. Find the item you want to order
2. Tap the **"+"** button to add one unit
3. Tap again to add more units
4. The cart count updates in the floating cart button

#### Managing Cart
- **View Cart Total**: The floating button shows item count and total price
- **Remove Items**: Tap the **"-"** button to reduce quantity
- **View Details**: Each item shows name, description, and price

#### Changing Language
- Tap the language toggle (🇵🇹/🇬🇧) in the top right to switch between Portuguese and English

---

### Tablet Waiter Interface

#### Table Management View

**Viewing Tables**
1. Navigate to `/tablet` or select "Tablet Waiter" from landing
2. Switch to the "Tables" tab
3. All restaurant tables display with real-time status

**Table Status Colors**
- 🟢 **Green**: Available for seating
- 🔵 **Blue**: Occupied with guests
- 🟡 **Yellow**: Reserved for upcoming reservation
- 🟠 **Orange**: Cleaning in progress

**Table Information**
- Table number (e.g., "Table 1")
- Current occupancy vs capacity (e.g., "4/4 guests")
- Current status

**Creating New Orders**
1. Find an occupied table
2. Tap the **"New Order"** button
3. Select menu items for the table (future feature)

#### Active Orders View

**Viewing Orders**
1. Switch to the "Orders" tab
2. All active orders display with status badges

**Order Status Types**
- **Pending**: Waiting for confirmation
- **Preparing**: Kitchen is preparing
- **Ready**: Ready for service
- **Completed**: Delivered to customer

**Order Information**
- Table number
- Number of items in order
- Time since order placed
- Total amount
- Current status with icon

**Order Actions**
- **View Details**: Tap to see full order breakdown (future feature)
- **Cancel**: Cancel the order with confirmation (future feature)

---

### Kiosk Self-Service Interface

#### Customer Self-Ordering
1. Navigate to `/kiosk`
2. Touch anywhere to begin
3. Browse menu categories
4. Add items to order
5. Review order summary
6. Proceed to payment
7. Collect receipt and order number

**Design Features**
- Extra-large touch targets for easy interaction
- High contrast for readability
- Simplified navigation
- Clear call-to-action buttons

---

### Staff Dashboard Interface

#### Accessing the Dashboard
1. Navigate to `/staff` or select "Staff Dashboard" from landing
2. The dashboard displays with real-time business metrics

#### Dashboard Sections

**Sales Overview**
- **Today's Sales**: Current day revenue (updates real-time)
- **Weekly Sales**: Last 7 days total
- **Monthly Sales**: Current month total
- Percentage changes from previous periods

**Operational Metrics**
- **Active Orders**: Currently processing orders
- **Active Tables**: Tables with guests
- **Staff Online**: Currently logged-in employees

**Recent Orders**
Lists the most recent orders with:
- Table number
- Number of items
- Order status
- Total amount
- Time ago (e.g., "5 min ago")

**Top Menu Items**
Shows best-selling items with:
- Item name (localized)
- Total orders count
- Revenue generated

#### Changing Language
Use the language toggle to switch between Portuguese and English. All metrics, labels, and data display in the selected language.

---

## Technical Specifications

### Performance Targets
- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Lighthouse Score**: 90+
- **Bundle Size**: < 500KB (gzipped)

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari (iOS 14+)
- Chrome Mobile (Android 8+)

### Device Support
- **Mobile**: 375px - 767px (portrait)
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px+
- **Touch**: Full touch event support
- **Mouse/Keyboard**: Full pointer event support

### Accessibility
- WCAG 2.1 Level AA compliance (target)
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Touch target sizes: minimum 44x44px

### API Rate Limits
Supabase default limits apply:
- Anonymous requests: 1000/hour
- Authenticated requests: 10000/hour
- Real-time connections: 200 concurrent

---

## Security & Access Control

### Current Security Status

⚠️ **WARNING**: The application currently has **no authentication system implemented**. This is a critical security vulnerability that must be addressed before production deployment.

### Planned Security Features

#### Authentication (To Be Implemented)
- Supabase Auth with email/password
- PIN-based authentication for POS terminals
- Session management with automatic timeout
- Secure password hashing (bcrypt)
- Multi-factor authentication (future)

#### Row-Level Security (RLS)
All database tables have RLS enabled but require policies:
- User can only access data for their tenant
- Role-based access control via policies
- Employees can only view their own profile data
- Managers can access reporting data
- Cashiers limited to payment processing

#### Data Protection
- Encryption at rest (Supabase default)
- Encryption in transit (HTTPS/TLS)
- Sensitive data masking (card numbers, PINs)
- Audit logging for all sensitive operations
- Regular automated backups

#### Compliance
- GDPR considerations for customer data
- PCI-DSS compliance for payment processing (future)
- Data retention policies
- Right to erasure support

---

## Multi-Language Support

### Supported Languages
1. **Portuguese (pt)** - Default language for Mozambique
2. **English (en)** - Secondary language

### Translation Architecture

The application uses a context-based translation system:
- `LanguageContext` provides translation function `t(key)`
- Translation keys are organized by feature area
- All UI text is translatable
- Language preference persists in localStorage

### Adding New Translations

To add a new translation key:

```typescript
// In src/contexts/LanguageContext.tsx
const translations = {
  pt: {
    // ... existing translations
    newKey: "Novo texto em português"
  },
  en: {
    // ... existing translations
    newKey: "New text in English"
  }
};

// In components
const { t } = useLanguage();
<p>{t('newKey')}</p>
```

### Translation Coverage

**Landing Page**
- Interface selection cards
- System description
- Footer information

**Mobile Customer**
- Menu categories
- Menu item names and descriptions
- Cart labels
- Search placeholder

**Tablet Waiter**
- Table status labels
- Order status labels
- Action buttons
- Time indicators

**Staff Dashboard**
- Metric labels
- Report headings
- Status indicators

---

## Roadmap & Future Enhancements

### Phase 1: Security & Authentication (Immediate)
- [ ] Implement Supabase authentication
- [ ] Create login/logout flows for all interfaces
- [ ] Define and implement RLS policies
- [ ] Add role-based access control
- [ ] Implement session management

### Phase 2: Core Functionality (Short-term)
- [ ] Complete order creation workflow
- [ ] Payment processing integration
- [ ] Receipt generation and printing
- [ ] Real-time order status updates
- [ ] Kitchen display system

### Phase 3: Advanced Features (Medium-term)
- [ ] Mobile money integration (M-Pesa, e-Mola)
- [ ] Customer loyalty program
- [ ] Email/SMS notifications
- [ ] Advanced reporting and analytics
- [ ] Inventory forecasting

### Phase 4: Scale & Optimization (Long-term)
- [ ] Offline mode with sync
- [ ] Multi-location management
- [ ] API for third-party integrations
- [ ] White-label customization
- [ ] Advanced business intelligence

---

## Support & Maintenance

### Getting Help
- **Documentation**: This file (DOCUMENTATION.md)
- **Project Repository**: Check README.md for latest updates
- **Lovable Community**: https://discord.gg/lovable (Discord)
- **Lovable Docs**: https://docs.lovable.dev

### Reporting Issues
When reporting issues, include:
1. Interface affected (mobile/tablet/kiosk/staff)
2. Steps to reproduce
3. Expected vs actual behavior
4. Browser and device information
5. Screenshots or screen recordings if possible

### Version History
- **v1.0.0** (Current): Initial release with all four interfaces and database schema

---

## License & Credits

**Built with:**
- React + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (via Lovable Cloud)
- Lovable development platform

**Target Market:** Mozambique restaurant industry

**Designed for:** Multi-tenant deployment supporting restaurants of all sizes from single locations to multi-location enterprises.

---

*Last Updated: 2025-10-28*
*Version: 1.0.0*
