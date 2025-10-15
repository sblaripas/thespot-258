import React, { useState, useEffect } from 'react';
import { 
  Users, Plus, Mail, Phone, Shield, Lock, X, Save,
  ChevronLeft, ChevronRight, Edit2, Trash2, UserCircle2
} from 'lucide-react';

// Types
interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'Owner' | 'Administrator' | 'Manager' | 'Cashier' | 'Waiter';
  pin?: string;
  createdAt: string;
}

interface Owner {
  pinSet: boolean;
  pin?: string;
}

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<Employee[]>([
    {
      id: '1',
      name: 'Owner',
      email: 'owner@gmail.com',
      phone: '—',
      role: 'Owner',
      createdAt: new Date().toISOString()
    }
  ]);
  
  const [owner, setOwner] = useState<Owner>({ pinSet: false });
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showPinModal, setShowPinModal] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());
  
  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '' as Employee['role'] | '',
    pin: ''
  });

  // PIN input
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [confirmPinInput, setConfirmPinInput] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'set' | 'confirm'>('set');

  const itemsPerPage = 10;
  const totalPages = Math.ceil(employees.length / itemsPerPage);
  const startIdx = (currentPage - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  const currentEmployees = employees.slice(startIdx, endIdx);

  const roles: Employee['role'][] = ['Administrator', 'Manager', 'Cashier', 'Waiter'];

  const handleAddEmployee = () => {
    if (!owner.pinSet) {
      setShowPinModal(true);
    } else {
      setShowCreateForm(true);
    }
  };

  const handlePinChange = (index: number, value: string, isPinConfirm: boolean = false) => {
    if (value.length > 1) return;
    if (!/^\d*$/.test(value)) return;

    const newPin = isPinConfirm ? [...confirmPinInput] : [...pinInput];
    newPin[index] = value;
    
    if (isPinConfirm) {
      setConfirmPinInput(newPin);
    } else {
      setPinInput(newPin);
    }

    // Auto-focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(
        isPinConfirm ? `confirm-pin-${index + 1}` : `pin-${index + 1}`
      );
      nextInput?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent, isPinConfirm: boolean = false) => {
    if (e.key === 'Backspace' && !(isPinConfirm ? confirmPinInput[index] : pinInput[index]) && index > 0) {
      const prevInput = document.getElementById(
        isPinConfirm ? `confirm-pin-${index - 1}` : `pin-${index - 1}`
      );
      prevInput?.focus();
    }
  };

  const handleConfirmPin = () => {
    const pin = pinInput.join('');
    const confirmPin = confirmPinInput.join('');

    if (pin.length !== 4) {
      alert('Please enter a 4-digit PIN');
      return;
    }

    if (pinStep === 'set') {
      setPinStep('confirm');
      return;
    }

    if (pin !== confirmPin) {
      alert('PINs do not match. Please try again.');
      setPinInput(['', '', '', '']);
      setConfirmPinInput(['', '', '', '']);
      setPinStep('set');
      return;
    }

    setOwner({ pinSet: true, pin });
    setShowPinModal(false);
    setShowCreateForm(true);
    setPinInput(['', '', '', '']);
    setConfirmPinInput(['', '', '', '']);
    setPinStep('set');
  };

  const handleSaveEmployee = () => {
    if (!formData.name || !formData.role) {
      alert('Please fill in required fields: Name and Role');
      return;
    }

    if (formData.pin && formData.pin.length !== 4) {
      alert('PIN must be 4 digits');
      return;
    }

    if (editingEmployee) {
      setEmployees(employees.map(emp => 
        emp.id === editingEmployee.id 
          ? { ...emp, ...formData, role: formData.role as Employee['role'] }
          : emp
      ));
    } else {
      const newEmployee: Employee = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        role: formData.role as Employee['role'],
        pin: formData.pin,
        createdAt: new Date().toISOString()
      };
      setEmployees([...employees, newEmployee]);
    }

    resetForm();
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      role: employee.role,
      pin: employee.pin || ''
    });
    setShowCreateForm(true);
  };

  const handleDeleteEmployee = (id: string) => {
    if (confirm('Are you sure you want to delete this employee?')) {
      setEmployees(employees.filter(emp => emp.id !== id));
      selectedEmployees.delete(id);
      setSelectedEmployees(new Set(selectedEmployees));
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      role: '',
      pin: ''
    });
    setEditingEmployee(null);
    setShowCreateForm(false);
  };

  const toggleSelectAll = () => {
    if (selectedEmployees.size === currentEmployees.length) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(currentEmployees.map(emp => emp.id)));
    }
  };

  const toggleSelectEmployee = (id: string) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedEmployees(newSelected);
  };

  const getRoleColor = (role: Employee['role']) => {
    switch (role) {
      case 'Owner': return 'text-purple-400 bg-purple-500/20';
      case 'Administrator': return 'text-red-400 bg-red-500/20';
      case 'Manager': return 'text-blue-400 bg-blue-500/20';
      case 'Cashier': return 'text-emerald-400 bg-emerald-500/20';
      case 'Waiter': return 'text-amber-400 bg-amber-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-none bg-emerald-700 p-4">
          <div className="max-w-7xl mx-auto flex items-center gap-3">
            <Users className="w-6 h-6 text-white" />
            <h1 className="text-xl font-bold text-white">Employee list</h1>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-200 p-6">
          <div className="max-w-7xl mx-auto">
            {/* Add Employee Button */}
            <div className="mb-6">
              <button
                onClick={handleAddEmployee}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 font-semibold transition-colors shadow-lg"
              >
                <Plus className="w-5 h-5" />
                ADD EMPLOYEE
              </button>
            </div>

            {/* Employee Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-100 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-left w-12">
                      <input
                        type="checkbox"
                        checked={selectedEmployees.size === currentEmployees.length && currentEmployees.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </th>
                    <th className="p-4 text-left text-slate-600 font-semibold">Name</th>
                    <th className="p-4 text-left text-slate-600 font-semibold">Email</th>
                    <th className="p-4 text-left text-slate-600 font-semibold">Phone</th>
                    <th className="p-4 text-left text-slate-600 font-semibold">Role</th>
                    <th className="p-4 text-right text-slate-600 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentEmployees.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <input
                          type="checkbox"
                          checked={selectedEmployees.has(employee.id)}
                          onChange={() => toggleSelectEmployee(employee.id)}
                          className="w-4 h-4 rounded border-slate-300"
                          disabled={employee.role === 'Owner'}
                        />
                      </td>
                      <td className="p-4 text-slate-800 font-medium">{employee.name}</td>
                      <td className="p-4 text-slate-600">{employee.email}</td>
                      <td className="p-4 text-slate-600">{employee.phone}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(employee.role)}`}>
                          {employee.role}
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        {employee.role !== 'Owner' && (
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleEditEmployee(employee)}
                              className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteEmployee(employee.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              <div className="bg-slate-50 px-4 py-3 flex items-center justify-between border-t border-slate-200">
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="text-slate-600 text-sm">
                  Page <input 
                    type="number" 
                    value={currentPage} 
                    onChange={(e) => setCurrentPage(Math.max(1, Math.min(totalPages, parseInt(e.target.value) || 1)))}
                    className="w-12 px-2 py-1 border border-slate-300 rounded text-center mx-2"
                  /> of {totalPages}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* PIN Modal */}
        {showPinModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
              <div className="flex flex-col items-center mb-6">
                <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mb-4">
                  <Lock className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-bold text-slate-800">
                  {pinStep === 'set' ? 'SET PIN CODE' : 'CONFIRM PIN CODE'}
                </h2>
              </div>

              <div className="flex justify-center gap-3 mb-6">
                {(pinStep === 'set' ? pinInput : confirmPinInput).map((digit, idx) => (
                  <input
                    key={idx}
                    id={pinStep === 'set' ? `pin-${idx}` : `confirm-pin-${idx}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handlePinChange(idx, e.target.value, pinStep === 'confirm')}
                    onKeyDown={(e) => handlePinKeyDown(idx, e, pinStep === 'confirm')}
                    className="w-16 h-16 text-center text-2xl font-bold border-2 border-orange-400 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200"
                  />
                ))}
              </div>

              <p className="text-slate-600 text-sm text-center mb-6">
                {pinStep === 'set' 
                  ? "When adding employees the authentication by PIN code regime is enabled. Set your own PIN to enter Loyverse POS application."
                  : "Please re-enter your PIN to confirm."
                }
              </p>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowPinModal(false);
                    setPinInput(['', '', '', '']);
                    setConfirmPinInput(['', '', '', '']);
                    setPinStep('set');
                  }}
                  className="flex-1 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-medium transition-colors"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleConfirmPin}
                  className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                >
                  {pinStep === 'set' ? 'NEXT' : 'CONFIRM'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Create/Edit Employee Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-slate-100 rounded-lg max-w-lg w-full my-8">
              {/* Header */}
              <div className="bg-emerald-700 p-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-white">
                  {editingEmployee ? 'Edit employee' : 'Create employee'}
                </h2>
              </div>

              <div className="p-6">
                {/* Avatar */}
                <div className="flex justify-center mb-6">
                  <div className="w-24 h-24 bg-teal-600 rounded-full flex items-center justify-center">
                    <UserCircle2 className="w-16 h-16 text-white" />
                  </div>
                </div>

                {/* Form */}
                <div className="space-y-4">
                  <div className="bg-white rounded-lg p-4">
                    <label className="text-slate-500 text-sm mb-2 block">Name</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="John"
                      className="w-full text-slate-800 text-lg font-medium focus:outline-none"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="john@mail.com"
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="5553354896"
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      Role
                    </label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value as Employee['role'] })}
                      className="w-full text-slate-800 focus:outline-none bg-transparent"
                    >
                      <option value="">Select role</option>
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-white rounded-lg p-4">
                    <label className="text-slate-500 text-sm mb-2 flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      PIN (4 digits, optional)
                    </label>
                    <input
                      type="password"
                      value={formData.pin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                        setFormData({ ...formData, pin: value });
                      }}
                      placeholder="••••"
                      maxLength={4}
                      className="w-full text-slate-800 focus:outline-none"
                    />
                  </div>

                  <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
                    <p className="text-amber-800 text-sm flex items-start gap-2">
                      <Shield className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>
                        Employee PIN is used for authentication in POS. If left blank, the employee can access POS without PIN.
                      </span>
                    </p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-6 py-3 bg-slate-300 hover:bg-slate-400 text-slate-700 rounded-lg font-semibold transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveEmployee}
                    className="flex-1 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                  >
                    <Save className="w-5 h-5" />
                    SAVE
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmployeeManagement;