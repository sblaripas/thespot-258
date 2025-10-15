import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, DollarSign, ShoppingBag, Users, Calendar,
  Download, ChevronLeft, ChevronRight, Filter, BarChart3,
  LineChart, CreditCard, Smartphone, Banknote
} from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data generator
const generateMockSalesData = () => {
  const employees = ['Robert', 'Joaquim', 'Ana'];
  const paymentTypes = ['Cash', 'Card', 'Mobile Payment'];
  const categories = ['CERVEJAS', 'CIDRAS', 'COCKTAILS', 'SHOTS', 'LICOR', 'SECAS'];
  
  const items = [
    { name: "2M", category: "CERVEJAS", price: 130, cost: 80 },
    { name: "HEINEKEN", category: "CERVEJAS", price: 130, cost: 85 },
    { name: "GIN & TONIC", category: "COCKTAILS", price: 380, cost: 200 },
    { name: "CAIPIRINHA DE LIMÃO", category: "COCKTAILS", price: 250, cost: 120 },
    { name: "MOJITO", category: "COCKTAILS", price: 300, cost: 150 },
    { name: "FLYING FISH", category: "CIDRAS", price: 150, cost: 95 },
    { name: "SAVANNA DRY", category: "CIDRAS", price: 180, cost: 110 },
    { name: "TEQUILA JOSE CUERVO", category: "SHOTS", price: 200, cost: 120 },
    { name: "JAGER BOMB", category: "SHOTS", price: 400, cost: 250 },
    { name: "JAMESON SIMPLES", category: "SECAS", price: 200, cost: 130 },
  ];

  const sales = [];
  const startDate = new Date('2025-09-08');
  const endDate = new Date('2025-10-08');
  
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const dailySales = Math.floor(Math.random() * 20) + 15;
    
    for (let i = 0; i < dailySales; i++) {
      const item = items[Math.floor(Math.random() * items.length)];
      const employee = employees[Math.floor(Math.random() * employees.length)];
      const paymentType = paymentTypes[Math.floor(Math.random() * paymentTypes.length)];
      const quantity = Math.floor(Math.random() * 4) + 1;
      const discount = Math.random() > 0.8 ? Math.floor(Math.random() * 20) + 5 : 0;
      const refund = Math.random() > 0.95;
      
      const grossAmount = item.price * quantity;
      const discountAmount = (grossAmount * discount) / 100;
      const netAmount = refund ? 0 : grossAmount - discountAmount;
      const costAmount = item.cost * quantity;
      const profit = netAmount - costAmount;
      
      sales.push({
        id: `SALE-${Date.now()}-${i}`,
        date: new Date(d).toISOString(),
        employee,
        item: item.name,
        category: item.category,
        quantity,
        unitPrice: item.price,
        unitCost: item.cost,
        grossAmount,
        discount,
        discountAmount,
        refund,
        refundAmount: refund ? grossAmount : 0,
        netAmount,
        costAmount,
        profit,
        paymentType,
        table: Math.floor(Math.random() * 20) + 1,
      });
    }
  }
  
  return sales;
};

const SalesReports = () => {
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({
    start: '2025-09-08',
    end: '2025-10-08'
  });
  const [selectedEmployee, setSelectedEmployee] = useState('all');
  const [timePeriod, setTimePeriod] = useState('all');
  const [chartType, setChartType] = useState('area');
  const [chartPeriod, setChartPeriod] = useState('days');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const salesData = useMemo(() => generateMockSalesData(), []);
  
  const employees = ['all', ...new Set(salesData.map(s => s.employee))];

  // Filter data
  const filteredData = useMemo(() => {
    return salesData.filter(sale => {
      const saleDate = new Date(sale.date);
      const start = new Date(dateRange.start);
      const end = new Date(dateRange.end);
      
      const dateMatch = saleDate >= start && saleDate <= end;
      const employeeMatch = selectedEmployee === 'all' || sale.employee === selectedEmployee;
      
      return dateMatch && employeeMatch && !sale.refund;
    });
  }, [salesData, dateRange, selectedEmployee]);

  // Calculate metrics
  const metrics = useMemo(() => {
    const gross = filteredData.reduce((sum, s) => sum + s.grossAmount, 0);
    const refunds = salesData.filter(s => s.refund).reduce((sum, s) => sum + s.refundAmount, 0);
    const discounts = filteredData.reduce((sum, s) => sum + s.discountAmount, 0);
    const net = filteredData.reduce((sum, s) => sum + s.netAmount, 0);
    const cost = filteredData.reduce((sum, s) => sum + s.costAmount, 0);
    const profit = net - cost;
    const items = filteredData.reduce((sum, s) => sum + s.quantity, 0);
    
    return {
      grossSales: gross,
      refunds,
      discounts,
      netSales: net,
      costOfGoods: cost,
      grossProfit: profit,
      profitMargin: net > 0 ? (profit / net) * 100 : 0,
      itemsSold: items,
      transactions: filteredData.length,
      avgTransaction: filteredData.length > 0 ? net / filteredData.length : 0,
      avgItemsPerTransaction: filteredData.length > 0 ? items / filteredData.length : 0,
    };
  }, [filteredData, salesData]);

  // Chart data
  const chartData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(sale => {
      const date = new Date(sale.date);
      let key;
      
      if (chartPeriod === 'days') {
        key = date.toISOString().split('T')[0];
      } else if (chartPeriod === 'weeks') {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toISOString().split('T')[0];
      } else {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }
      
      if (!grouped[key]) {
        grouped[key] = { date: key, sales: 0, profit: 0, items: 0 };
      }
      
      grouped[key].sales += sale.netAmount;
      grouped[key].profit += sale.profit;
      grouped[key].items += sale.quantity;
    });
    
    return Object.values(grouped).sort((a, b) => a.date.localeCompare(b.date));
  }, [filteredData, chartPeriod]);

  // Category data
  const categoryData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(sale => {
      if (!grouped[sale.category]) {
        grouped[sale.category] = {
          category: sale.category,
          sales: 0,
          profit: 0,
          items: 0,
          transactions: 0,
        };
      }
      
      grouped[sale.category].sales += sale.netAmount;
      grouped[sale.category].profit += sale.profit;
      grouped[sale.category].items += sale.quantity;
      grouped[sale.category].transactions += 1;
    });
    
    return Object.values(grouped).sort((a, b) => b.sales - a.sales);
  }, [filteredData]);

  // Employee data
  const employeeData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(sale => {
      if (!grouped[sale.employee]) {
        grouped[sale.employee] = {
          employee: sale.employee,
          sales: 0,
          profit: 0,
          items: 0,
          transactions: 0,
        };
      }
      
      grouped[sale.employee].sales += sale.netAmount;
      grouped[sale.employee].profit += sale.profit;
      grouped[sale.employee].items += sale.quantity;
      grouped[sale.employee].transactions += 1;
    });
    
    return Object.values(grouped).sort((a, b) => b.sales - a.sales);
  }, [filteredData]);

  // Item data
  const itemData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(sale => {
      if (!grouped[sale.item]) {
        grouped[sale.item] = {
          item: sale.item,
          category: sale.category,
          sales: 0,
          profit: 0,
          quantity: 0,
          transactions: 0,
        };
      }
      
      grouped[sale.item].sales += sale.netAmount;
      grouped[sale.item].profit += sale.profit;
      grouped[sale.item].quantity += sale.quantity;
      grouped[sale.item].transactions += 1;
    });
    
    return Object.values(grouped).sort((a, b) => b.sales - a.sales).slice(0, 10);
  }, [filteredData]);

  // Payment data
  const paymentData = useMemo(() => {
    const grouped = {};
    
    filteredData.forEach(sale => {
      if (!grouped[sale.paymentType]) {
        grouped[sale.paymentType] = {
          type: sale.paymentType,
          sales: 0,
          transactions: 0,
        };
      }
      
      grouped[sale.paymentType].sales += sale.netAmount;
      grouped[sale.paymentType].transactions += 1;
    });
    
    return Object.values(grouped).sort((a, b) => b.sales - a.sales);
  }, [filteredData]);

  const handleExport = () => {
    alert('Export functionality - would download CSV/PDF report');
  };

  const formatCurrency = (value) => `${value.toFixed(2)} MT`;
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-PT', { month: 'short', day: 'numeric' });
  };

  const KPICard = ({ icon: Icon, label, value, subtitle, color }) => (
    <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-slate-400 text-sm">{label}</span>
      </div>
      <div className="text-2xl font-bold text-white mb-1">{value}</div>
      {subtitle && <div className="text-slate-500 text-xs">{subtitle}</div>}
    </div>
  );

  const renderSummary = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard
          icon={DollarSign}
          label="Gross Sales"
          value={formatCurrency(metrics.grossSales)}
          color="bg-blue-500/20 text-blue-400"
        />
        <KPICard
          icon={TrendingUp}
          label="Net Sales"
          value={formatCurrency(metrics.netSales)}
          subtitle={`-${formatCurrency(metrics.refunds + metrics.discounts)} adjustments`}
          color="bg-emerald-500/20 text-emerald-400"
        />
        <KPICard
          icon={DollarSign}
          label="Gross Profit"
          value={formatCurrency(metrics.grossProfit)}
          subtitle={`${metrics.profitMargin.toFixed(1)}% margin`}
          color="bg-purple-500/20 text-purple-400"
        />
        <KPICard
          icon={ShoppingBag}
          label="Items Sold"
          value={metrics.itemsSold}
          subtitle={`${metrics.transactions} transactions`}
          color="bg-amber-500/20 text-amber-400"
        />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-2">Avg Transaction</div>
          <div className="text-xl font-bold text-white">{formatCurrency(metrics.avgTransaction)}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-2">Avg Items/Transaction</div>
          <div className="text-xl font-bold text-white">{metrics.avgItemsPerTransaction.toFixed(1)}</div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
          <div className="text-slate-400 text-sm mb-2">Cost of Goods</div>
          <div className="text-xl font-bold text-white">{formatCurrency(metrics.costOfGoods)}</div>
        </div>
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-white font-semibold">Sales Trend</h3>
          <div className="flex gap-2">
            {['days', 'weeks', 'months'].map(period => (
              <button
                key={period}
                onClick={() => setChartPeriod(period)}
                className={`px-3 py-1 rounded-lg text-sm ${
                  chartPeriod === period
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          {chartType === 'area' ? (
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Area type="monotone" dataKey="sales" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
            </AreaChart>
          ) : (
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="date" stroke="#94a3b8" tickFormatter={formatDate} />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="sales" fill="#3b82f6" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );

  const renderCategoryReport = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300 text-sm font-semibold">Category</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Sales</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Profit</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Transactions</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Avg Sale</th>
              </tr>
            </thead>
            <tbody>
              {categoryData.map((cat, idx) => (
                <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{cat.category}</td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{formatCurrency(cat.sales)}</td>
                  <td className="px-4 py-3 text-right text-purple-400">{formatCurrency(cat.profit)}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{cat.items}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{cat.transactions}</td>
                  <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(cat.sales / cat.transactions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderEmployeeReport = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-700/50">
              <tr>
                <th className="px-4 py-3 text-left text-slate-300 text-sm font-semibold">Employee</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Sales</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Profit</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Items</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Transactions</th>
                <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Avg Sale</th>
              </tr>
            </thead>
            <tbody>
              {employeeData.map((emp, idx) => (
                <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <Users className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-white font-medium">{emp.employee}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{formatCurrency(emp.sales)}</td>
                  <td className="px-4 py-3 text-right text-purple-400">{formatCurrency(emp.profit)}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{emp.items}</td>
                  <td className="px-4 py-3 text-right text-slate-300">{emp.transactions}</td>
                  <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(emp.sales / emp.transactions)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderItemReport = () => {
    const topItems = itemData.slice(0, 5);
    
    return (
      <div className="space-y-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-white font-semibold mb-4">Top 5 Items by Sales</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topItems} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis type="number" stroke="#94a3b8" />
              <YAxis dataKey="item" type="category" stroke="#94a3b8" width={150} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                labelStyle={{ color: '#94a3b8' }}
              />
              <Bar dataKey="sales" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-300 text-sm font-semibold">Item</th>
                  <th className="px-4 py-3 text-left text-slate-300 text-sm font-semibold">Category</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Sales</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Quantity</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Profit</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Avg Price</th>
                </tr>
              </thead>
              <tbody>
                {itemData.map((item, idx) => (
                  <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                    <td className="px-4 py-3 text-white font-medium">{item.item}</td>
                    <td className="px-4 py-3 text-slate-400 text-sm">{item.category}</td>
                    <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{formatCurrency(item.sales)}</td>
                    <td className="px-4 py-3 text-right text-slate-300">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-purple-400">{formatCurrency(item.profit)}</td>
                    <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(item.sales / item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPaymentReport = () => {
    const getPaymentIcon = (type) => {
      switch(type) {
        case 'Cash': return Banknote;
        case 'Card': return CreditCard;
        case 'Mobile Payment': return Smartphone;
        default: return DollarSign;
      }
    };

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {paymentData.map((payment, idx) => {
            const Icon = getPaymentIcon(payment.type);
            const percentage = (payment.sales / metrics.netSales) * 100;
            
            return (
              <div key={idx} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-blue-500/20 rounded-lg">
                    <Icon className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">{payment.type}</div>
                    <div className="text-slate-400 text-sm">{payment.transactions} transactions</div>
                  </div>
                </div>
                <div className="text-2xl font-bold text-emerald-400 mb-2">{formatCurrency(payment.sales)}</div>
                <div className="text-slate-400 text-sm">{percentage.toFixed(1)}% of total sales</div>
              </div>
            );
          })}
        </div>

        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-700/50">
                <tr>
                  <th className="px-4 py-3 text-left text-slate-300 text-sm font-semibold">Payment Type</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Total Sales</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Transactions</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">Avg Transaction</th>
                  <th className="px-4 py-3 text-right text-slate-300 text-sm font-semibold">% of Total</th>
                </tr>
              </thead>
              <tbody>
                {paymentData.map((payment, idx) => {
                  const percentage = (payment.sales / metrics.netSales) * 100;
                  const Icon = getPaymentIcon(payment.type);
                  
                  return (
                    <tr key={idx} className="border-t border-slate-700/50 hover:bg-slate-700/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-medium">{payment.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right text-emerald-400 font-semibold">{formatCurrency(payment.sales)}</td>
                      <td className="px-4 py-3 text-right text-slate-300">{payment.transactions}</td>
                      <td className="px-4 py-3 text-right text-blue-400">{formatCurrency(payment.sales / payment.transactions)}</td>
                      <td className="px-4 py-3 text-right text-purple-400">{percentage.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const reportTypes = [
    { id: 'summary', label: 'Sales Summary', icon: TrendingUp },
    { id: 'category', label: 'By Category', icon: BarChart3 },
    { id: 'employee', label: 'By Employee', icon: Users },
    { id: 'item', label: 'By Item', icon: ShoppingBag },
    { id: 'payment', label: 'By Payment', icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Sales Reports</h1>
              <p className="text-slate-400 text-sm">Analytics & Performance</p>
            </div>
          </div>

          {/* Report Type Selector */}
          <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
            {reportTypes.map(type => {
              const Icon = type.icon;
              return (
                <button
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-all ${
                    reportType === type.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {type.label}
                </button>
              );
            })}
          </div>

          {/* Filters */}
          <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="text-slate-400 text-xs mb-2 block">Start Date</label>
                <input
                  type="date"
                  value={dateRange.start}
                  onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-2 block">End Date</label>
                <input
                  type="date"
                  value={dateRange.end}
                  onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-2 block">Employee</label>
                <select
                  value={selectedEmployee}
                  onChange={(e) => setSelectedEmployee(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {employees.map(emp => (
                    <option key={emp} value={emp}>
                      {emp === 'all' ? 'All Employees' : emp}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 text-xs mb-2 block">Time Period</label>
                <select
                  value={timePeriod}
                  onChange={(e) => setTimePeriod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Day</option>
                  <option value="morning">Morning (6am-12pm)</option>
                  <option value="afternoon">Afternoon (12pm-6pm)</option>
                  <option value="evening">Evening (6pm-12am)</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 mt-4 pt-4 border-t border-slate-700">
              <button
                onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
                className="flex items-center gap-2 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm transition-colors"
              >
                {chartType === 'area' ? <LineChart className="w-4 h-4" /> : <BarChart3 className="w-4 h-4" />}
                {chartType === 'area' ? 'Area Chart' : 'Bar Chart'}
              </button>

              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm transition-colors ml-auto"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>
          </div>
        </div>

        {/* Report Content */}
        <div>
          {reportType === 'summary' && renderSummary()}
          {reportType === 'category' && renderCategoryReport()}
          {reportType === 'employee' && renderEmployeeReport()}
          {reportType === 'item' && renderItemReport()}
          {reportType === 'payment' && renderPaymentReport()}
        </div>
      </div>
    </div>
  );
};

export default SalesReports;