# Sales Reports System Documentation

## Overview

The Sales Reports System is a comprehensive React-based analytics dashboard designed for bar/restaurant management. It provides detailed insights into sales performance, employee productivity, product categories, and payment methods with interactive visualizations and reporting capabilities.

## System Architecture

### Core Components

#### 1. Data Generation Module
```typescript
generateMockSalesData(): SalesRecord[]
```
- **Purpose**: Generates realistic sales data for demonstration and testing
- **Data Points**:
  - Employee assignments (Robert, Joaquim, Ana)
  - Payment types (Cash, Card, Mobile Payment)
  - Product categories (CERVEJAS, CIDRAS, COCKTAILS, SHOTS, LICOR, SECAS)
  - Item pricing and cost structures
  - Date range simulation (2025-09-08 to 2025-10-08)

#### 2. State Management
```typescript
const [state, setState] = useState(initialValue)
```
- **Report Type**: Controls current view (summary, category, employee, item, payment)
- **Date Range**: Filterable start and end dates
- **Employee Filter**: Individual or all employees
- **Chart Configuration**: Type (area/bar) and period (days/weeks/months)
- **Pagination**: Current page for data tables

#### 3. Data Processing Pipeline
```typescript
useMemo(() => processingLogic, [dependencies])
```
- **Filtered Data**: Applies date range and employee filters
- **Metrics Calculation**: Real-time KPI computations
- **Chart Data**: Time-series aggregation
- **Category/Employee/Item Analysis**: Grouped performance data

## Features Breakdown

### 1. Sales Summary Dashboard
**Key Metrics:**
- Gross Sales: Total revenue before adjustments
- Net Sales: Revenue after refunds and discounts
- Gross Profit: Net sales minus cost of goods
- Items Sold: Total quantity with transaction count
- Average Transaction Value
- Average Items per Transaction
- Cost of Goods Sold

**Interactive Elements:**
- Time period toggles (Days/Weeks/Months)
- Chart type switching (Area/Bar)
- Real-time metric updates

### 2. Category Performance Report
**Data Columns:**
- Category name
- Total sales amount
- Profit margin
- Items sold count
- Transaction volume
- Average sale value

**Features:**
- Sortable by sales performance
- Profitability analysis per category
- Transaction density insights

### 3. Employee Performance Report
**Metrics Tracked:**
- Individual sales totals
- Profit generation
- Items sold per employee
- Transaction counts
- Average sale performance

**UI Elements:**
- Employee avatars with icons
- Performance ranking
- Comparative analysis

### 4. Item Performance Report
**Top 5 Items Visualization:**
- Horizontal bar chart for sales comparison
- Detailed table with all items
- Category classification
- Profit per item analysis

**Data Points:**
- Item name and category
- Sales revenue
- Quantity sold
- Profit margin
- Average selling price

### 5. Payment Method Analysis
**Payment Types:**
- Cash (Banknote icon)
- Card (CreditCard icon)
- Mobile Payment (Smartphone icon)

**Analysis Features:**
- Sales distribution by payment type
- Transaction volume per method
- Percentage of total sales
- Average transaction value comparison

## Data Models

### Sales Record Structure
```typescript
interface SalesRecord {
  id: string;
  date: string;
  employee: string;
  item: string;
  category: string;
  quantity: number;
  unitPrice: number;
  unitCost: number;
  grossAmount: number;
  discount: number;
  discountAmount: number;
  refund: boolean;
  refundAmount: number;
  netAmount: number;
  costAmount: number;
  profit: number;
  paymentType: string;
  table: number;
}
```

### Metric Calculations
```typescript
interface SalesMetrics {
  grossSales: number;
  refunds: number;
  discounts: number;
  netSales: number;
  costOfGoods: number;
  grossProfit: number;
  profitMargin: number;
  itemsSold: number;
  transactions: number;
  avgTransaction: number;
  avgItemsPerTransaction: number;
}
```

## UI/UX Design System

### Color Scheme
- **Primary**: Slate gradient (900 → 800 → 900)
- **Accent Colors**:
  - Blue: Primary actions, sales metrics
  - Emerald: Net sales, positive metrics
  - Purple: Profit indicators
  - Amber: Item/quantity metrics

### Component Hierarchy
```
SalesReports
├── Header (Title + Report Type Selector)
├── Filter Panel (Date, Employee, Period)
├── Main Content Area
│   ├── Summary Dashboard (KPIs + Charts)
│   ├── Category Report (Table)
│   ├── Employee Report (Table + Avatars)
│   ├── Item Report (Chart + Table)
│   └── Payment Report (Cards + Table)
└── Export Controls
```

### Responsive Design
- Mobile-first grid system
- Collapsible tables with horizontal scroll
- Adaptive chart containers
- Flexible KPI card layouts

## Missing Features & Implementation Notes

### 1. Data Export Functionality
**Current State**: Placeholder alert
**Recommended Implementation**:
```typescript
const handleExport = (format: 'csv' | 'pdf') => {
  // Generate CSV data
  if (format === 'csv') {
    const csvData = convertToCSV(filteredData);
    downloadCSV(csvData, `sales-report-${dateRange.start}-${dateRange.end}.csv`);
  }
  // Generate PDF report
  else {
    generatePDFReport(metrics, chartData, currentView);
  }
};
```

### 2. Real Data Integration
**Current State**: Mock data generation
**Integration Points**:
- REST API endpoints for sales data
- WebSocket connections for real-time updates
- Database connectivity configuration

### 3. Advanced Filtering
**Missing Features**:
- Multiple employee selection
- Category-specific filtering
- Time-of-day analysis (currently UI only)
- Custom date ranges beyond preset

### 4. Authentication & Authorization
**Security Requirements**:
- Role-based access control
- Employee-specific data restrictions
- Audit logging for report access

### 5. Performance Optimizations
**Recommended Enhancements**:
- Virtual scrolling for large datasets
- Data pagination for all tables
- Cached calculations for frequently accessed metrics
- Lazy loading for chart components

### 6. Additional Analytics
**Potential Extensions**:
- Seasonal trend analysis
- Customer behavior patterns
- Inventory turnover rates
- Peak hour performance
- Table turnover metrics

## Technical Specifications

### Dependencies
```json
{
  "react": "^18.x",
  "recharts": "Chart visualization library",
  "lucide-react": "Icon library",
  "date-fns": "Date utilities (recommended)"
}
```

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Considerations
- Memoized calculations prevent unnecessary re-renders
- ResponsiveContainer from Recharts for adaptive charts
- Efficient data filtering with useMemo hooks
- Paginated data tables for large datasets

## Setup & Deployment

### Environment Requirements
- Node.js 16+
- React 18+
- Modern browser with ES6+ support

### Build Configuration
```javascript
// Recommended webpack configuration
{
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
        charts: {
          test: /[\\/]recharts[\\/]/,
          name: 'chart-vendor',
          chunks: 'all',
        }
      }
    }
  }
}
```

## Future Enhancements Roadmap

### Phase 1 (Short-term)
- [ ] Implement CSV export functionality
- [ ] Add PDF report generation
- [ ] Real-time data integration
- [ ] Advanced filtering options

### Phase 2 (Medium-term)
- [ ] User authentication system
- [ ] Role-based permissions
- [ ] Custom report builder
- [ ] Scheduled report generation

### Phase 3 (Long-term)
- [ ] Mobile application
- [ ] Predictive analytics
- [ ] Integration with POS systems
- [ ] Multi-location support

## Usage Examples

### Basic Implementation
```typescript
import SalesReports from './components/SalesReports';

function App() {
  return (
    <div className="App">
      <SalesReports />
    </div>
  );
}
```

### Custom Data Integration
```typescript
const SalesReportsWithRealData = () => {
  const [realSalesData, setRealSalesData] = useState([]);
  
  useEffect(() => {
    // Fetch real data from API
    fetchSalesData().then(setRealSalesData);
  }, []);
  
  return <SalesReports salesData={realSalesData} />;
};
```

This documentation provides a comprehensive overview of the Sales Reports System, covering current functionality, identified gaps, and a roadmap for future development. The system is designed to be extensible and can be adapted for various hospitality business scenarios.