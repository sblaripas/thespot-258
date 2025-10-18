import React, { useState, useMemo } from 'react';
import { 
  Clock, Download, ChevronLeft, ChevronRight, Calendar, Users, DollarSign, TrendingUp
} from 'lucide-react';

interface Shift {
  id: string;
  pos: string;
  openingTime: string;
  closingTime: string;
  expectedCash: number;
  actualCash: number;
  difference: number;
  employee: string;
  date: string;
  status: 'closed';
}

const ShiftsManagement: React.FC = () => {
  // Mock data generator
  const generateMockShifts = (): Shift[] => {
    const shifts: Shift[] = [];
    const posTerminals = ['POS 1', 'POS 2', 'POS 3', 'POS 4'];
    const employees = ['Robert', 'Joaquim', 'Ana'];
    
    const startDate = new Date('2025-09-08');
    const endDate = new Date('2025-10-07');
    
    for (let i = 0; i < 45; i++) {
      const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
      const openHour = Math.floor(Math.random() * 3) + 8; // 8-10 AM
      const closeHour = Math.floor(Math.random() * 3) + 20; // 8-10 PM
      
      const expectedCash = Math.floor(Math.random() * 50000) + 10000;
      const variance = (Math.random() - 0.5) * 2000; // -1000 to +1000 variance
      const actualCash = expectedCash + variance;
      
      shifts.push({
        id: `SHIFT${1000 + i}`,
        pos: posTerminals[Math.floor(Math.random() * posTerminals.length)],
        openingTime: `${openHour.toString().padStart(2, '0')}:00`,
        closingTime: `${closeHour.toString().padStart(2, '0')}:00`,
        expectedCash,
        actualCash,
        difference: actualCash - expectedCash,
        employee: employees[Math.floor(Math.random() * employees.length)],
        date: date.toISOString().split('T')[0],
        status: 'closed'
      });
    }
    
    return shifts.sort((a, b) => new Date(b.date + ' ' + b.closingTime).getTime() - new Date(a.date + ' ' + a.closingTime).getTime());
  };

  const [shifts] = useState<Shift[]>(generateMockShifts());
  const [dateRange, setDateRange] = useState({ start: '2025-09-08', end: '2025-10-07' });
  const [selectedEmployee, setSelectedEmployee] = useState('All employees');
  const [selectedPOS, setSelectedPOS] = useState('All POS');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const employees = ['All employees', ...Array.from(new Set(shifts.map(s => s.employee)))];
  const posTerminals = ['All POS', ...Array.from(new Set(shifts.map(s => s.pos)))];

  // Filter shifts
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      const shiftDate = new Date(shift.date);
      const startDate = new Date(dateRange.start);
      const endDate = new Date(dateRange.end);
      
      const dateMatch = shiftDate >= startDate && shiftDate <= endDate;
      const employeeMatch = selectedEmployee === 'All employees' || shift.employee === selectedEmployee;
      const posMatch = selectedPOS === 'All POS' || shift.pos === selectedPOS;
      
      return dateMatch && employeeMatch && posMatch;
    });
  }, [shifts, dateRange, selectedEmployee, selectedPOS]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalExpected = filteredShifts.reduce((sum, s) => sum + s.expectedCash, 0);
    const totalActual = filteredShifts.reduce((sum, s) => sum + s.actualCash, 0);
    const totalDifference = totalActual - totalExpected;
    const averageAccuracy = filteredShifts.length > 0 
      ? (filteredShifts.filter(s => Math.abs(s.difference) < 100).length / filteredShifts.length) * 100
      : 0;

    return {
      totalShifts: filteredShifts.length,
      totalExpected,
      totalActual,
      totalDifference,
      averageAccuracy,
      shiftsWithVariance: filteredShifts.filter(s => Math.abs(s.difference) > 100).length
    };
  }, [filteredShifts]);

  // Pagination
  const totalPages = Math.ceil(filteredShifts.length / rowsPerPage);
  const startIdx = (currentPage - 1) * rowsPerPage;
  const endIdx = startIdx + rowsPerPage;
  const currentShifts = filteredShifts.slice(startIdx, endIdx);

  const handleExport = () => {
    let csvContent = 'POS,Date,Opening Time,Closing Time,Employee,Expected Cash,Actual Cash,Difference\n';
    filteredShifts.forEach(shift => {
      csvContent += `"${shift.pos}","${shift.date}","${shift.openingTime}","${shift.closingTime}","${shift.employee}","${shift.expectedCash.toFixed(2)}","${shift.actualCash.toFixed(2)}","${shift.difference.toFixed(2)}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `shifts-${dateRange.start}-to-${dateRange.end}.csv`;
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
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">Shifts</h1>
                <p className="text-slate-400 text-xs">Closed shifts and cash management</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex-none bg-slate-100 border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto flex flex-wrap gap-3">
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

            <select
              value={selectedPOS}
              onChange={(e) => setSelectedPOS(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {posTerminals.map(pos => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>

            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {employees.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="flex-none bg-white border-b border-slate-200 p-4">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span className="text-slate-600 text-sm">Total Shifts</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.totalShifts}</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                <span className="text-slate-600 text-sm">Total Expected</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.totalExpected.toFixed(2)} MT</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <span className="text-slate-600 text-sm">Total Actual</span>
              </div>
              <div className="text-2xl font-bold text-slate-800">{stats.totalActual.toFixed(2)} MT</div>
            </div>

            <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-amber-500" />
                <span className="text-slate-600 text-sm">Total Variance</span>
              </div>
              <div className={`text-2xl font-bold ${stats.totalDifference >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {stats.totalDifference >= 0 ? '+' : ''}{stats.totalDifference.toFixed(2)} MT
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-7xl mx-auto p-4">
            {/* Export Button */}
            <div className="mb-4">
              <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded hover:bg-slate-50 text-sm font-semibold text-slate-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                EXPORT
              </button>
            </div>

            {/* Table */}
            {currentShifts.length > 0 ? (
              <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">POS</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Date</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Opening time</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Closing time</th>
                      <th className="px-4 py-3 text-left text-slate-600 text-sm font-medium">Employee</th>
                      <th className="px-4 py-3 text-right text-slate-600 text-sm font-medium">Expected cash amount</th>
                      <th className="px-4 py-3 text-right text-slate-600 text-sm font-medium">Actual cash amount</th>
                      <th className="px-4 py-3 text-right text-slate-600 text-sm font-medium">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentShifts.map((shift) => (
                      <tr key={shift.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-3 text-slate-800 font-medium">{shift.pos}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">
                          {new Date(shift.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{shift.openingTime}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{shift.closingTime}</td>
                        <td className="px-4 py-3 text-slate-600 text-sm">{shift.employee}</td>
                        <td className="px-4 py-3 text-right text-slate-800 font-medium">{shift.expectedCash.toFixed(2)} MT</td>
                        <td className="px-4 py-3 text-right text-slate-800 font-medium">{shift.actualCash.toFixed(2)} MT</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`font-semibold ${
                            Math.abs(shift.difference) < 100 ? 'text-emerald-600' :
                            shift.difference > 0 ? 'text-blue-600' : 'text-red-600'
                          }`}>
                            {shift.difference >= 0 ? '+' : ''}{shift.difference.toFixed(2)} MT
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Clock className="w-16 h-16 text-slate-400" />
                </div>
                <h3 className="text-xl font-semibold text-slate-700 mb-2">No data to display</h3>
                <p className="text-slate-500">There are no closed shifts in the selected time period</p>
              </div>
            )}

            {/* Pagination */}
            {currentShifts.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 border border-slate-300 rounded hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>
                    Page: 
                    <input 
                      type="number" 
                      value={currentPage}
                      onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                      className="w-16 px-2 py-1 border border-slate-300 rounded text-center mx-2"
                    /> 
                    of {totalPages}
                  </span>
                  
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
      </div>
    </div>
  );
};

export default ShiftsManagement;