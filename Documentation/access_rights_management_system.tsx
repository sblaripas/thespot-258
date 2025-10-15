import React, { useState } from 'react';
import { 
  Users, Plus, Shield, ChevronLeft, ChevronRight, Trash2, Edit2,
  ShoppingCart, TrendingUp, Check
} from 'lucide-react';

// Types
interface Permission {
  id: string;
  label: string;
  description?: string;
}

interface Role {
  id: string;
  name: string;
  color: string;
  employeeCount: number;
  posAccess: boolean;
  posPermissions: string[];
  backOfficeAccess: boolean;
  backOfficePermissions: string[];
}

const AccessRightsManagement: React.FC = () => {
  const [roles, setRoles] = useState<Role[]>([
    {
      id: '1',
      name: 'Owner',
      color: 'bg-orange-500',
      employeeCount: 1,
      posAccess: true,
      posPermissions: [
        'pos_login', 'accept_payments', 'apply_discounts', 'change_taxes',
        'manage_tickets', 'void_items', 'open_drawer', 'view_receipts',
        'perform_refunds', 'reprint_receipts', 'view_shift', 'manage_items',
        'view_cost', 'change_settings'
      ],
      backOfficeAccess: true,
      backOfficePermissions: [
        'bo_login', 'view_sales', 'cancel_receipts', 'bo_manage_items',
        'bo_view_cost', 'manage_employees', 'manage_customers', 'manage_features',
        'manage_billing', 'manage_payments', 'manage_loyalty', 'manage_taxes',
        'manage_kitchen', 'manage_dining', 'manage_devices'
      ]
    },
    {
      id: '2',
      name: 'Administrator',
      color: 'bg-purple-500',
      employeeCount: 0,
      posAccess: true,
      posPermissions: [
        'pos_login', 'accept_payments', 'apply_discounts', 'change_taxes',
        'manage_tickets', 'void_items', 'open_drawer', 'view_receipts',
        'perform_refunds', 'reprint_receipts', 'view_shift', 'manage_items',
        'view_cost', 'change_settings'
      ],
      backOfficeAccess: true,
      backOfficePermissions: [
        'bo_login', 'view_sales', 'cancel_receipts', 'bo_manage_items',
        'bo_view_cost', 'manage_employees', 'manage_customers', 'manage_features',
        'manage_payments', 'manage_loyalty', 'manage_taxes',
        'manage_kitchen', 'manage_dining', 'manage_devices'
      ]
    },
    {
      id: '3',
      name: 'Manager',
      color: 'bg-blue-500',
      employeeCount: 0,
      posAccess: true,
      posPermissions: [
        'pos_login', 'accept_payments', 'apply_discounts', 'change_taxes',
        'manage_tickets', 'void_items', 'open_drawer', 'view_receipts',
        'perform_refunds', 'reprint_receipts', 'view_shift', 'manage_items',
        'view_cost', 'change_settings'
      ],
      backOfficeAccess: true,
      backOfficePermissions: [
        'bo_login', 'view_sales', 'bo_manage_items', 'bo_view_cost'
      ]
    },
    {
      id: '4',
      name: 'Cashier',
      color: 'bg-teal-500',
      employeeCount: 0,
      posAccess: true,
      posPermissions: ['pos_login', 'accept_payments'],
      backOfficeAccess: false,
      backOfficePermissions: []
    }
  ]);

  const [showRoleEditor, setShowRoleEditor] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState<Set<string>>(new Set());

  const posPermissions: Permission[] = [
    { id: 'pos_login', label: 'Employees can log in to the app using personal PIN code' },
    { id: 'accept_payments', label: 'Accept payments' },
    { id: 'apply_discounts', label: 'Apply discounts with restricted access' },
    { id: 'change_taxes', label: 'Change taxes in a sale' },
    { id: 'manage_tickets', label: 'Manage all open tickets' },
    { id: 'void_items', label: 'Void saved items in open tickets' },
    { id: 'open_drawer', label: 'Open cash drawer without making a sale' },
    { id: 'view_receipts', label: 'View all receipts' },
    { id: 'perform_refunds', label: 'Perform refunds' },
    { id: 'reprint_receipts', label: 'Reprint and resend receipts' },
    { id: 'view_shift', label: 'View shift report' },
    { id: 'manage_items', label: 'Manage items' },
    { id: 'view_cost', label: 'View cost of items' },
    { id: 'change_settings', label: 'Change settings' }
  ];

  const backOfficePermissions: Permission[] = [
    { id: 'bo_login', label: 'Employees can log in to the back office using their email and password' },
    { id: 'view_sales', label: 'View sales reports' },
    { id: 'cancel_receipts', label: 'Cancel receipts' },
    { id: 'bo_manage_items', label: 'Manage items' },
    { id: 'bo_view_cost', label: 'View cost of items' },
    { id: 'manage_employees', label: 'Manage employees' },
    { id: 'manage_customers', label: 'Manage customers' },
    { id: 'manage_features', label: 'Manage feature settings' },
    { id: 'manage_billing', label: 'Manage billing' },
    { id: 'manage_payments', label: 'Manage payment types' },
    { id: 'manage_loyalty', label: 'Manage loyalty program' },
    { id: 'manage_taxes', label: 'Manage taxes' },
    { id: 'manage_kitchen', label: 'Manage kitchen printers' },
    { id: 'manage_dining', label: 'Manage dining options' },
    { id: 'manage_devices', label: 'Manage POS devices', description: 'This permission also allows to sign into POS using email and password' }
  ];

  const handleCreateNewRole = () => {
    const newRole: Role = {
      id: Date.now().toString(),
      name: '',
      color: 'bg-indigo-500',
      employeeCount: 0,
      posAccess: false,
      posPermissions: [],
      backOfficeAccess: false,
      backOfficePermissions: []
    };
    setEditingRole(newRole);
    setIsCreatingNew(true);
    setShowRoleEditor(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole({ ...role });
    setIsCreatingNew(false);
    setShowRoleEditor(true);
  };

  const handleTogglePOSAccess = () => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        posAccess: !editingRole.posAccess,
        posPermissions: !editingRole.posAccess ? ['pos_login'] : []
      });
    }
  };

  const handleToggleBackOfficeAccess = () => {
    if (editingRole) {
      setEditingRole({
        ...editingRole,
        backOfficeAccess: !editingRole.backOfficeAccess,
        backOfficePermissions: !editingRole.backOfficeAccess ? ['bo_login'] : []
      });
    }
  };

  const handleTogglePOSPermission = (permissionId: string) => {
    if (!editingRole) return;

    const isEnabled = editingRole.posPermissions.includes(permissionId);
    
    if (isEnabled) {
      setEditingRole({
        ...editingRole,
        posPermissions: editingRole.posPermissions.filter(p => p !== permissionId)
      });
    } else {
      setEditingRole({
        ...editingRole,
        posPermissions: [...editingRole.posPermissions, permissionId]
      });
    }
  };

  const handleToggleBackOfficePermission = (permissionId: string) => {
    if (!editingRole) return;

    const isEnabled = editingRole.backOfficePermissions.includes(permissionId);
    
    if (isEnabled) {
      setEditingRole({
        ...editingRole,
        backOfficePermissions: editingRole.backOfficePermissions.filter(p => p !== permissionId)
      });
    } else {
      setEditingRole({
        ...editingRole,
        backOfficePermissions: [...editingRole.backOfficePermissions, permissionId]
      });
    }
  };

  const handleSaveRole = () => {
    if (!editingRole) return;

    if (!editingRole.name.trim()) {
      alert('Please enter a role name');
      return;
    }

    if (isCreatingNew) {
      setRoles([...roles, editingRole]);
    } else {
      setRoles(roles.map(r => r.id === editingRole.id ? editingRole : r));
    }
    
    setShowRoleEditor(false);
    setEditingRole(null);
    setIsCreatingNew(false);
  };

  const handleDeleteRole = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    if (!role) return;
    
    if (role.name === 'Owner') {
      alert('Cannot delete Owner role');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the ${role.name} role?`)) {
      setRoles(roles.filter(r => r.id !== roleId));
      selectedRoles.delete(roleId);
      setSelectedRoles(new Set(selectedRoles));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedRoles.size === 0) return;
    
    if (confirm(`Are you sure you want to delete ${selectedRoles.size} role(s)?`)) {
      setRoles(roles.filter(r => !selectedRoles.has(r.id) || r.name === 'Owner'));
      setSelectedRoles(new Set());
    }
  };

  const toggleSelectRole = (roleId: string) => {
    const newSelected = new Set(selectedRoles);
    if (newSelected.has(roleId)) {
      newSelected.delete(roleId);
    } else {
      newSelected.add(roleId);
    }
    setSelectedRoles(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedRoles.size === roles.length) {
      setSelectedRoles(new Set());
    } else {
      setSelectedRoles(new Set(roles.map(r => r.id)));
    }
  };

  const itemsPerPage = 10;
  const totalPages = Math.ceil(roles.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="h-screen flex flex-col">
        {/* Header */}
        <div className="flex-none bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-indigo-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Access Rights</h1>
                  <p className="text-slate-400 text-xs">Manage roles and permissions</p>
                </div>
              </div>
              <button
                onClick={handleCreateNewRole}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                ADD ROLE
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-100 p-6">
          <div className="max-w-7xl mx-auto">
            {selectedRoles.size > 0 && (
              <div className="mb-4 flex items-center gap-3">
                <span className="text-slate-700 font-medium">{selectedRoles.size} selected</span>
                <button
                  onClick={handleDeleteSelected}
                  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}

            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="p-4 text-left w-12">
                      <input 
                        type="checkbox" 
                        checked={selectedRoles.size === roles.length && roles.length > 0}
                        onChange={toggleSelectAll}
                        className="w-4 h-4 rounded border-slate-300"
                      />
                    </th>
                    <th className="p-4 text-left text-slate-600 font-semibold">Role</th>
                    <th className="p-4 text-left text-slate-600 font-semibold">Access</th>
                    <th className="p-4 text-right text-slate-600 font-semibold">Employees</th>
                    <th className="p-4 text-right text-slate-600 font-semibold w-24">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((role) => (
                    <tr 
                      key={role.id} 
                      className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4">
                        <input 
                          type="checkbox" 
                          checked={selectedRoles.has(role.id)}
                          onChange={() => toggleSelectRole(role.id)}
                          className="w-4 h-4 rounded border-slate-300"
                        />
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-12 h-12 ${role.color} rounded-full flex items-center justify-center text-white text-xl`}>
                            <Users className="w-6 h-6" />
                          </div>
                          <span className="text-slate-800 font-medium">{role.name}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600">
                        {role.posAccess && role.backOfficeAccess ? 'Back office and POS' :
                         role.posAccess ? 'POS' :
                         role.backOfficeAccess ? 'Back office' : 'No access'}
                      </td>
                      <td className="p-4 text-right text-slate-800 font-medium">{role.employeeCount}</td>
                      <td className="p-4 text-right">
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditRole(role)}
                            className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          {role.name !== 'Owner' && (
                            <button
                              onClick={() => handleDeleteRole(role.id)}
                              className="p-2 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
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
                    className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 text-slate-600" />
                  </button>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 bg-white border border-slate-300 rounded hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-4 h-4 text-slate-600" />
                  </button>
                </div>
                <div className="text-slate-600 text-sm">
                  Page: <input 
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

        {/* Role Editor Modal */}
        {showRoleEditor && editingRole && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg max-w-2xl w-full my-8 max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="flex-none p-6 border-b border-slate-200">
                <div className="text-slate-500 text-sm mb-2">Name</div>
                {isCreatingNew ? (
                  <input
                    type="text"
                    value={editingRole.name}
                    onChange={(e) => setEditingRole({ ...editingRole, name: e.target.value })}
                    placeholder="Enter role name"
                    className="text-3xl font-bold text-slate-800 w-full focus:outline-none border-b-2 border-transparent focus:border-blue-500"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-3xl font-bold text-slate-800">{editingRole.name}</h2>
                )}
              </div>

              {/* Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {/* POS Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-600 rounded-full flex items-center justify-center">
                        <ShoppingCart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">POS</div>
                        <div className="text-sm text-slate-500">Employees can log in to the app using personal PIN code</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRole.posAccess}
                        onChange={handleTogglePOSAccess}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {editingRole.posAccess && (
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                      {posPermissions.map(perm => (
                        <label key={perm.id} className="flex items-start gap-3 cursor-pointer group">
                          <div className="flex-shrink-0 mt-0.5">
                            {editingRole.posPermissions.includes(perm.id) ? (
                              <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
                                <Check className="w-4 h-4 text-white" />
                              </div>
                            ) : (
                              <div className="w-5 h-5 border-2 border-slate-300 rounded group-hover:border-slate-400"></div>
                            )}
                          </div>
                          <input
                            type="checkbox"
                            checked={editingRole.posPermissions.includes(perm.id)}
                            onChange={() => handleTogglePOSPermission(perm.id)}
                            className="sr-only"
                          />
                          <span className="text-slate-700 text-sm flex-1">{perm.label}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Back Office Section */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <div className="text-lg font-semibold text-slate-800">Back office</div>
                        <div className="text-sm text-slate-500">Employees can log in to the back office using their email and password</div>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingRole.backOfficeAccess}
                        onChange={handleToggleBackOfficeAccess}
                        className="sr-only peer"
                      />
                      <div className="w-14 h-7 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-emerald-500"></div>
                    </label>
                  </div>

                  {editingRole.backOfficeAccess && (
                    <div className="space-y-3 pl-4 border-l-2 border-slate-200">
                      {backOfficePermissions.map(perm => (
                        <div key={perm.id}>
                          <label className="flex items-start gap-3 cursor-pointer group">
                            <div className="flex-shrink-0 mt-0.5">
                              {editingRole.backOfficePermissions.includes(perm.id) ? (
                                <div className="w-5 h-5 bg-emerald-500 rounded flex items-center justify-center">
                                  <Check className="w-4 h-4 text-white" />
                                </div>
                              ) : (
                                <div className="w-5 h-5 border-2 border-slate-300 rounded group-hover:border-slate-400"></div>
                              )}
                            </div>
                            <input
                              type="checkbox"
                              checked={editingRole.backOfficePermissions.includes(perm.id)}
                              onChange={() => handleToggleBackOfficePermission(perm.id)}
                              className="sr-only"
                            />
                            <div className="flex-1">
                              <span className="text-slate-700 text-sm">{perm.label}</span>
                              {perm.description && (
                                <div className="text-slate-500 text-xs mt-1">{perm.description}</div>
                              )}
                            </div>
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex-none border-t border-slate-200 p-4 flex items-center justify-between">
                {!isCreatingNew && editingRole.name !== 'Owner' && (
                  <button
                    onClick={() => {
                      handleDeleteRole(editingRole.id);
                      setShowRoleEditor(false);
                    }}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
                <div className={`flex gap-3 ${isCreatingNew || editingRole.name === 'Owner' ? 'ml-auto' : ''}`}>
                  <button
                    onClick={() => {
                      setShowRoleEditor(false);
                      setEditingRole(null);
                      setIsCreatingNew(false);
                    }}
                    className="px-6 py-2 text-slate-600 hover:bg-slate-100 rounded-lg font-medium transition-colors"
                  >
                    CANCEL
                  </button>
                  <button
                    onClick={handleSaveRole}
                    className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium transition-colors"
                  >
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

export default AccessRightsManagement;