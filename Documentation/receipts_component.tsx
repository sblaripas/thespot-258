import React, { useState, useMemo } from 'react';
import { 
  Receipt, Calendar, Clock, Users, Search, Download, 
  ChevronLeft, ChevronRight, FileText, DollarSign, RotateCcw
} from 'lucide-react';

interface ReceiptRecord {
  id: string;
  receiptNo: string;
  date: string;
  time: string;
  employee: string;
  customer: string;
  type: 'Sale' | 'Refund';
  items: Array<{ name: string; quantity: number; price: number }>;
  subtotal: number;
  tax: number;
  total: number;
  paymentMethod: 'Cash' | 'Card' | 'Mobile Payment';
}

const ReceiptsComponent: React.FC = () => {
  // Mock data generator
  const generateMockReceipts = (): ReceiptRecord[] => {
    const receipts: ReceiptRecord[] = [];
    const employees = ['Robert', 'Joaquim', 'Ana'];
    const customers = ['John Doe', 'Jane Smith', 'Maria Santos', 'Pedro Costa', 'Walk-in Customer'];
    const items = [
      { name: '2M Beer', price: 130 },
      { name: 'Heineken', price: 130 },
      { name: 'Caipirinha', price: 250 },
      { name: 'Gin & Tonic', price: 380 }
    ];
    
    const startDate = new Date('2025-09-08');
    const endDate = new Date('2025-10-07');
    
    for (let i = 0; i < 50; i++) {
      const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      const hour = Math.floor(Math.random() * 16) + 8; // 8 AM to 11 PM
      const minute = Math.floor(Math.random() * 60);
      
      const orderItems = [];
      const itemCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < itemCount; j++) {
        const item = items[Math.floor(Math.random() * items.length)];
        orderItems.push({
          name: item.name,
          quantity: Math.floor(Math.random() * 3) + 1,
          price: item.price
        });
      }
      
      const subtotal = orderItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.16; // 16% tax
      const total = subtotal + tax;
      
      receipts.push({
        id: `REC${1000 + i}`,
        receiptNo: `#${1000 + i}`,
        date: date.toISOString().split('T')[0],
        time: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
        employee: employees[Math.floor(Math.random() * employees.length)],
        customer: customers[Math.floor(Math.random() * customers.length)],
        type: Math.random() > 0.9 ? 'Refund' : 'Sale',
        items: orderItems,
        subtotal,
        tax,
        total,
        paymentMethod: ['Cash', 'Card', 'Mobile Payment'][Math.floor(Math.random() * 3)] as any
      });
    }
    
    return receipts.sort((a, b) => new Date(b.date + ' ' + b.time).getTime() - new Date(a.date + ' ' + a.time).getTime());
  };

  const [receipts] = useState<ReceiptRecord[]>(generateMockReceipts());
  const [dateRange, setDateRange] = useState({ start: '2025-09-08', end: '2025-10-07' });
  const [selectedEmployee, setSelectedEmployee] = useState('All employees');
  const [timeFilter, setTimeFilter] = useState('All day');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptRecord | null>(null);

  const employees = ['All employees', ...Array.from(new Set(receipts.map(r => r.employee)))];
  const timeFilters = ['All day', 'Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-12AM)'];

  // Filter receipts
  const filteredReceipts = useMemo(() => {
    return receipts.filter(receipt => {
      const receiptDate = new Date(receipt.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const dateMatch = receiptDate >= startDate && receiptDate <= endDate;
      const employeeMatch = selectedEmployee === 'All employees' || receipt.employee === selectedEmployee;
      
      let timeMatch = true;
      if (timeFilter !== 'All day') {
        const hour = parseInt(receipt.time.split(':')[0]);
        if (timeFilter.includes('Morning')) timeMatch = hour >= 6 && hour < 12;
        if (timeFilter.includes('Afternoon')) timeMatch = hour >= 12 && hour < 18;
        if (timeFilter.includes('Evening')) timeMatch = hour >= 18 && hour < 24;
      }
      
      const searchMatch = searchTerm === '' || 
        receipt.receiptNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        receipt.employee.toLowerCase().includes(searchTerm.toLowerCase());
      
      return dateMatch && employeeMatch && timeMatch && searchMatch;
    });
  }, [receipts, dateRange, selectedEmployee, timeFilter, searchTerm]);

  // Calculate stats
  const stats = useMemo(() => {
    const sales = filteredReceipts.filter(r => r.type === 'Sale');
    const refunds = filteredReceipts.filter(r => r.type === 'Refund');
    
    return {
      totalReceipts: filteredReceipts.length,
      totalSales: sales.length,
      totalRefunds: refunds.length,
      salesAmount: sales.reduce((sum, r) => sum + r.total, 0),
      refundsAmount: refunds.reduce((sum, r) => sum + r.total, 0)
    };
  }, [filteredReceipts]);

  // Pagination
  const totalPages = Math.ceil(filteredReceipts.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentReceipts = filteredReceipts.slice(startIdx, endIdx);

  const handleExport = () => {
    let csvContent = 'Receipt No,Date,Time,Employee,Customer,Type,Total,Payment Method\n';
    filteredReceipts.forEach(receipt => {
      csvContent += `"${receipt.receiptNo}","${receipt.date}","${receipt.time}","${receipt.employee}","${receipt.customer}","${receipt.type}","${receipt.total.toFixed(2)}","${receipt.paymentMethod}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipts-${dateRange.start}-to-${dateRange.end}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-none bg-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-xl font-bold text-white">Receipts</h1>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-none bg-slate-100 border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg">
              <Calendar className="w-4 h-4 text-slate-600" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="border-none focus:outline-none text-sm"
              />
              <span className="text-slate-500">-</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="border-none focus:outline-none text-sm"
              />
            </div>

            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
              <ChevronRight className="w-4 h-4" />
            </button>

            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {timeFilters.map(filter => (
                <option key={filter} value={filter}>{filter}</option>
              ))}
            </select>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="flex-none bg-white border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto grid grid-cols-3 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-slate-500 rounded-full flex items-center justify-center">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-slate-600 text-sm">All receipts</div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalReceipts}</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center">
                <DollarSign className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-slate-600 text-sm">Sales</div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalSales}</div>
                <div className="text-emerald-600 text-xs">{stats.salesAmount.toFixed(2)} MT</div>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-pink-500 rounded-full flex items-center justify-center">
                <RotateCcw className="w-8 h-8 text-white" />
              </div>
              <div>
                <div className="text-slate-600 text-sm">Refunds</div>
                <div className="text-3xl font-bold text-slate-800">{stats.totalRefunds}</div>
                <div className="text-pink-600 text-xs">{stats.refundsAmount.toFixed(2)} MT</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto p-4">
            {/* Export and Search */}
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 text-sm font-medium"
              >
                <Download className="w-4 h-4" />
                EXPORT
              </button>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search receipts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Table */}
            {currentReceipts.length > 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Receipt no.</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Employee</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Customer</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Type</th>
                      <th className="px-4 py-3 text-right text-slate-600 text-sm font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentReceipts.map((receipt) => (
                      <tr
                        key={receipt.id}
                        onClick={() => setSelectedReceipt(receipt)}
                        className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        <td className="px-4 py-3 text-slate-800 font-medium">{receipt.receiptNo}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {new Date(receipt.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          <span className="text-slate-400 ml-2">{receipt.time}</span>
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{receipt.employee}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{receipt.customer}</td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            receipt.type === 'Sale' 
                              ? 'bg-emerald-100 text-emerald-700' 
                              : 'bg-pink-100 text-pink-700'
                          }`}>
                            {receipt.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right text-slate-800 font-semibold">{receipt.total.toFixed(2)} MT</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                  <FileText className="w-12 h-12 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No data to display</h3>
                <p className="text-slate-500">There are no sales in the selected time period</p>
              </div>
            )}

            {/* Pagination */}
            {currentReceipts.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>Page: <input 
                    type="number" 
                    value={currentPage}
                    onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                    className="w-16 px-2 py-1 border border-slate-300 rounded text-center mx-1"
                  /> of {totalPages}</span>
                  
                  <span className="flex items-center gap-2">
                    Rows per page:
                    <select
                      value={rowsPerPage}
                      onChange={(e) => {
                        setRowsPerPage(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                      className="px-2 py-1 border border-slate-300 rounded"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Receipt Detail Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-slate-800">Receipt Details</h2>
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 pb-4 border-b">
                    <div>
                      <div className="text-slate-500 text-sm">Receipt No.</div>
                      <div className="font-semibold">{selectedReceipt.receiptNo}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Date & Time</div>
                      <div className="font-semibold">{selectedReceipt.date} {selectedReceipt.time}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Employee</div>
                      <div className="font-semibold">{selectedReceipt.employee}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Customer</div>
                      <div className="font-semibold">{selectedReceipt.customer}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Payment</div>
                      <div className="font-semibold">{selectedReceipt.paymentMethod}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-sm">Type</div>
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        selectedReceipt.type === 'Sale' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'bg-pink-100 text-pink-700'
                      }`}>
                        {selectedReceipt.type}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3">Items</h3>
                    <div className="space-y-2">
                      {selectedReceipt.items.map((item, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span>{item.quantity}x {item.name}</span>
                          <span className="font-medium">{(item.price * item.quantity).toFixed(2)} MT</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Subtotal</span>
                      <span>{selectedReceipt.subtotal.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-600">Tax (16%)</span>
                      <span>{selectedReceipt.tax.toFixed(2)} MT</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold pt-2 border-t">
                      <span>Total</span>
                      <span>{selectedReceipt.total.toFixed(2)} MT</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="w-full mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptsComponent;