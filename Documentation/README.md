# The Spot - Digital Restaurant Management System

A comprehensive digital management system for bars, restaurants, and entertainment venues.

## Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd the-spot
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
# Copy from Vercel project or Supabase dashboard
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
\`\`\`

4. Run database migrations:
\`\`\`bash
# Execute SQL scripts in order from /scripts directory
# Use Supabase SQL Editor or CLI
\`\`\`

5. Start development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000)

## Features

- **Digital Menu**: QR-based menu access for customers
- **POS System**: Staff order management
- **Inventory Management**: Real-time stock tracking
- **Wallet System**: Customer digital wallets
- **Order Tracking**: Live order status updates
- **Table Management**: QR codes and assignments
- **Staff Portal**: Role-based access control
- **Reports & Analytics**: Sales and inventory reports

## Documentation

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete documentation including:
- User manual
- Staff guide
- Technical documentation
- FAQ
- Troubleshooting

## Default Login Credentials

**Staff Portal** (`/staff`):
- Teller: `843992929` / `teller123`
- Staff: `823992929` / `staff123`
- Admin: `873992929` / `admin123`

## Tech Stack

- **Frontend**: Next.js 16, React 19.2, TypeScript
- **UI**: Tailwind CSS v4, shadcn/ui
- **Backend**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Project Structure

\`\`\`
the-spot/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── auth/              # Authentication pages
│   ├── inventory/         # Inventory management
│   ├── menu/              # Digital menu
│   ├── orders/            # Order management
│   ├── pos/               # Point of sale
│   ├── staff/             # Staff portal
│   ├── tables/            # Table management
│   ├── wallet/            # Customer wallet
│   └── waiter/            # Waiter interface
├── components/            # React components
│   ├── home/             # Homepage components
│   ├── inventory/        # Inventory components
│   ├── layout/           # Layout components
│   ├── ui/               # shadcn/ui components
│   └── wallet/           # Wallet components
├── lib/                   # Utility libraries
│   ├── i18n/             # Internationalization
│   ├── inventory/        # Inventory types
│   ├── supabase/         # Supabase client
│   └── types/            # TypeScript types
├── scripts/               # Database migration scripts
└── public/               # Static assets
\`\`\`

## Database Schema

18+ tables including:
- employees, roles, tenants
- menu_items, categories, orders
- inventory_items, stock_adjustments
- wallets, vouchers, transactions
- tables, table_assignments
- audit_log, discounts

See [DOCUMENTATION.md](./DOCUMENTATION.md) for complete schema details.

## Development

### Running Tests
\`\`\`bash
npm test
\`\`\`

### Building for Production
\`\`\`bash
npm run build
\`\`\`

### Linting
\`\`\`bash
npm run lint
\`\`\`

## Deployment

Deploy to Vercel:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

## Support

For issues and questions:
- Check [DOCUMENTATION.md](./DOCUMENTATION.md)
- Review FAQ section
- Contact system administrator

## License

Copyright © 2025 The Spot. All rights reserved.
