import React, { useState, useEffect } from 'react';
import { 
  Package, Plus, Search, AlertTriangle, Edit2, Trash2, 
  Save, X, Archive, CheckCircle, XCircle, DollarSign
} from 'lucide-react';

interface MenuItem {
  id: string;
  name: string;
  category: string;
  description?: string;
  size?: string;
  price: number;
  cost?: number;
  stockCount: number;
  lowStockThreshold: number;
  available: boolean;
  inStock: boolean;
  lastUpdated: string;
}

interface Category {
  id: string;
  name: string;
  itemCount: number;
}

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

const initialMenuData: MenuItem[] = [
  { id: '1', name: "2M", category: "CERVEJAS", size: "550ml", price: 130, cost: 80, stockCount: 45, lowStockThreshold: 10, available: true, inStock: true, lastUpdated: new Date().toISOString() },
  { id: '2', name: "2M Txoti", category: "CERVEJAS", size: "250ml", price: 120, cost: 75, stockCount: 8, lowStockThreshold: 10, available: true, inStock: true, lastUpdated: new Date().toISOString() },
  { id: '3', name: "HEINEKEN", category: "CERVEJAS", size: "210ml", price: 130, cost: 85, stockCount: 30, lowStockThreshold: 15, available: true, inStock: true, lastUpdated: new Date().toISOString() },
  { id: '4', name: "FLYING FISH", category: "CIDRAS", price: 150, cost: 95, stockCount: 20, lowStockThreshold: 10, available: true, inStock: true, lastUpdated: new Date().toISOString() },
  { id: '5', name: "CAIPIRINHA DE LIMÃO", category: "COCKTAILS", price: 250, cost: 120, stockCount: 0, lowStockThreshold: 5, available: false, inStock: false, lastUpdated: new Date().toISOString() },
  { id: '6', name: "GIN & TONIC", category: "COCKTAILS", price: 380, cost: 200, stockCount: 15, lowStockThreshold: 8, available: true, inStock: true, lastUpdated: new Date().toISOString() },
];

const InventoryManagement: React.FC = () => {
  const [inventory, setInventory] = useState<MenuItem[]>(initialMenuData);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStock, setFilterStock] = useState<'all' | 'inStock' | 'lowStock' | 'outOfStock'>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [formData, setFormData] = useState<Partial<MenuItem>>({
    name: '',
    category: '',
    description: '',
    size: '',
    price: 0,
    cost: 0,
    stockCount: 0,
    lowStockThreshold: 10,
    available: true,
    inStock: true,
  });
  const [newCategoryName, setNewCategoryName] = useState('');
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  useEffect(() => {
    const categoryMap = new Map<string, number>();
    inventory.forEach(item => {
      categoryMap.set(item.category, (categoryMap.get(item.category) || 0) + 1);
    });

    const cats: Category[] = Array.from(categoryMap.entries()).map(([name, count]) => ({
      id: name.toLowerCase().replace(/\s+/g, '-'),
      name,
      itemCount: count,
    }));

    setCategories(cats);
  }, [inventory]);

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    
    let matchesStock = true;
    if (filterStock === 'inStock') matchesStock = item.inStock && item.stockCount > item.lowStockThreshold;
    if (filterStock === 'lowStock') matchesStock = item.inStock && item.stockCount > 0 && item.stockCount <= item.lowStockThreshold;
    if (filterStock === 'outOfStock') matchesStock = !item.inStock || item.stockCount === 0;

    return matchesSearch && matchesCategory && matchesStock;
  });

  const stats = {
    totalItems: inventory.length,
    inStock: inventory.filter(i => i.inStock && i.stockCount > 0).length,
    lowStock: inventory.filter(i => i.inStock && i.stockCount > 0 && i.stockCount <= i.lowStockThreshold).length,
    outOfStock: inventory.filter(i => !i.inStock || i.stockCount === 0).length,
    totalValue: inventory.reduce((sum, i) => sum + (i.stockCount * (i.cost || 0)), 0),
  };

  const handleCreateItem = () => {
    if (!formData.name || !formData.category) {
      showNotification('Please fill in required fields: Name and Category', 'error');
      return;
    }

    const newItem: MenuItem = {
      id: Date.now().toString(),
      name: formData.name,
      category: formData.category,
      description: formData.description,
      size: formData.size,
      price: formData.price || 0,
      cost: formData.cost || 0,
      stockCount: formData.stockCount || 0,
      lowStockThreshold: formData.lowStockThreshold || 10,
      available: formData.available ?? true,
      inStock: (formData.stockCount || 0) > 0,
      lastUpdated: new Date().toISOString(),
    };

    setInventory([...inventory, newItem]);
    showNotification(`Item "${newItem.name}" created successfully!`, 'success');
    resetForm();
    setShowCreateForm(false);
  };

  const handleUpdateItem = () => {
    if (!editingItem || !formData.name || !formData.category) {
      showNotification('Please fill in required fields', 'error');
      return;
    }

    const updatedItem: MenuItem = {
      ...editingItem,
      name: formData.name,
      category: formData.category,
      description: formData.description,
      size: formData.size,
      price: formData.price || 0,
      cost: formData.cost || 0,
      stockCount: formData.stockCount || 0,
      lowStockThreshold: formData.lowStockThreshold || 10,
      available: formData.available ?? true,
      inStock: (formData.stockCount || 0) > 0,
      lastUpdated: new Date().toISOString(),
    };

    setInventory(inventory.map(item => item.id === editingItem.id ? updatedItem : item));
    showNotification(`Item "${updatedItem.name}" updated successfully!`, 'success');
    resetForm();
    setEditingItem(null);
    setShowCreateForm(false);
  };

  const handleDeleteItem = (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    if (confirm(`Are you sure you want to delete "${item.name}"?`)) {
      setInventory(inventory.filter(item => item.id !== id));
      showNotification(`Item "${item.name}" deleted successfully!`, 'success');
    }
  };

  const handleEditItem = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      size: item.size || '',
      price: item.price,
      cost: item.cost || 0,
      stockCount: item.stockCount,
      lowStockThreshold: item.lowStockThreshold,
      available: item.available,
      inStock: item.inStock,
    });
    setShowCreateForm(true);
  };

  const handleStockAdjustment = (id: string, adjustment: number) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    setInventory(inventory.map(item => {
      if (item.id === id) {
        const newStock = Math.max(0, item.stockCount + adjustment);
        return {
          ...item,
          stockCount: newStock,
          inStock: newStock > 0,
          lastUpdated: new Date().toISOString(),
        };
      }
      return item;
    }));

    const newStock = Math.max(0, item.stockCount + adjustment);
    showNotification(
      `Stock for "${item.name}" adjusted: ${item.stockCount} → ${newStock}`,
      'info'
    );
  };

  const handleAddNewCategory = () => {
    if (newCategoryName.trim()) {
      setFormData({ ...formData, category: newCategoryName.trim().toUpperCase() });
      setNewCategoryName('');
      setShowNewCategoryInput(false);
      showNotification(`New category "${newCategoryName.trim().toUpperCase()}" added`, 'info');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      description: '',
      size: '',
      price: 0,
      cost: 0,
      stockCount: 0,
      lowStockThreshold: 10,
      available: true,
      inStock: true,
    });
    setNewCategoryName('');
    setShowNewCategoryInput(false);
  };

  const getStockStatus = (item: MenuItem) => {
    if (!item.inStock || item.stockCount === 0) return { label: 'Out', color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' };
    if (item.stockCount <= item.lowStockThreshold) return { label: 'Low', color: 'text-amber-400', bg: 'bg-amber-500/20', border: 'border-amber-500/30' };
    return { label: 'OK', color: 'text-emerald-400', bg: 'bg-emerald-500/20', border: 'border-emerald-500/30' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {notifications.map(notification => (
          <div
            key={notification.id}
            className={`px-4 py-3 rounded-lg shadow-lg border flex items-center gap-2 min-w-[300px] animate-in slide-in-from-top ${
              notification.type === 'success'
                ? 'bg-emerald-500/90 border-emerald-400 text-white'
                : notification.type === 'error'
                ? 'bg-red-500/90 border-red-400 text-white'
                : 'bg-blue-500/90 border-blue-400 text-white'
            }`}
          >
            {notification.type === 'success' && <CheckCircle className="w-5 h-5" />}
            {notification.type === 'error' && <XCircle className="w-5 h-5" />}
            {notification.type === 'info' && <AlertTriangle className="w-5 h-5" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        ))}
      </div>

      <div className="h-screen flex flex-col">
        <div className="flex-none bg-slate-900/80 backdrop-blur-sm border-b border-slate-700 p-4">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Inventory</h1>
                  <p className="text-slate-400 text-xs">Stock Management</p>
                </div>
              </div>
              <button
                onClick={() => {
                  resetForm();
                  setEditingItem(null);
                  setShowCreateForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                New Item
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <Package className="w-4 h-4 text-blue-400" />
                  <span className="text-slate-400 text-xs">Total</span>
                </div>
                <div className="text-lg font-bold text-white">{stats.totalItems}</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                  <span className="text-slate-400 text-xs">In Stock</span>
                </div>
                <div className="text-lg font-bold text-emerald-400">{stats.inStock}</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <span className="text-slate-400 text-xs">Low</span>
                </div>
                <div className="text-lg font-bold text-amber-400">{stats.lowStock}</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <XCircle className="w-4 h-4 text-red-400" />
                  <span className="text-slate-400 text-xs">Out</span>
                </div>
                <div className="text-lg font-bold text-red-400">{stats.outOfStock}</div>
              </div>

              <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4 text-purple-400" />
                  <span className="text-slate-400 text-xs">Value</span>
                </div>
                <div className="text-lg font-bold text-purple-400">{stats.totalValue.toFixed(0)}</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Categories</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.name}>{cat.name} ({cat.itemCount})</option>
                ))}
              </select>

              <select
                value={filterStock}
                onChange={(e) => setFilterStock(e.target.value as any)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stock</option>
                <option value="inStock">In Stock Only</option>
                <option value="lowStock">Low Stock</option>
                <option value="outOfStock">Out of Stock</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-4">
            {filteredInventory.length === 0 ? (
              <div className="bg-slate-800/30 rounded-xl p-12 text-center border border-slate-700/50">
                <Archive className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <p className="text-slate-400">No items found</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredInventory.map(item => {
                  const status = getStockStatus(item);
                  const profit = item.price - (item.cost || 0);
                  const margin = item.cost ? ((profit / item.price) * 100) : 0;

                  return (
                    <div key={item.id} className="bg-slate-800/50 border border-slate-700/50 rounded-lg p-3 hover:bg-slate-800/70 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-white font-semibold text-sm truncate">{item.name}</h3>
                            {!item.available && (
                              <span className="text-xs bg-slate-700 text-slate-400 px-2 py-0.5 rounded flex-shrink-0">Hidden</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-slate-400">{item.category}</span>
                            {item.size && <span className="text-slate-500">• {item.size}</span>}
                          </div>
                        </div>

                        <div className="flex items-center gap-3 flex-shrink-0">
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Stock</div>
                            <div className="text-sm font-semibold text-white">{item.stockCount}</div>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-xs text-slate-500">Price</div>
                            <div className="text-sm font-semibold text-white">{item.price}</div>
                          </div>

                          <div className="text-right">
                            <div className="text-xs text-slate-500">Margin</div>
                            <div className="text-sm font-semibold text-emerald-400">{margin.toFixed(0)}%</div>
                          </div>

                          <div className={`px-2 py-1 rounded border ${status.bg} ${status.border}`}>
                            <span className={`${status.color} text-xs font-semibold`}>{status.label}</span>
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          <button
                            onClick={() => handleStockAdjustment(item.id, -1)}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            -1
                          </button>
                          <button
                            onClick={() => handleStockAdjustment(item.id, 1)}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            +1
                          </button>
                          <button
                            onClick={() => handleStockAdjustment(item.id, 10)}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded text-xs font-semibold transition-colors"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => handleEditItem(item)}
                            className="bg-blue-600 hover:bg-blue-700 text-white p-1.5 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteItem(item.id)}
                            className="bg-red-600 hover:bg-red-700 text-white p-1.5 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {item.stockCount <= item.lowStockThreshold && item.inStock && (
                        <div className="mt-2 flex items-center gap-2 text-amber-400 text-xs">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Below threshold ({item.lowStockThreshold} units)</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {showCreateForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-700">
              <div className="flex-none border-b border-slate-700 p-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">
                  {editingItem ? 'Edit Item' : 'Create New Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <h3 className="text-white font-semibold text-sm mb-3">Basic Information</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-slate-300 text-xs mb-1.5 block">Name *</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter item name"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-xs mb-1.5 block">Category *</label>
                      {!showNewCategoryInput ? (
                        <div className="flex gap-2">
                          <select
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>{cat.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => setShowNewCategoryInput(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                          >
                            New
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            className="flex-1 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="New category name"
                          />
                          <button
                            onClick={handleAddNewCategory}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <Save className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setShowNewCategoryInput(false);
                              setNewCategoryName('');
                            }}
                            className="bg-slate-700 hover:bg-slate-600 text-white px-3 py-2 rounded-lg transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-300 text-xs mb-1.5 block">Size</label>
                        <input
                          type="text"
                          value={formData.size}
                          onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., 550ml"
                        />
                      </div>
                      
                      <div>
                        <label className="text-slate-300 text-xs mb-1.5 block">Description</label>
                        <input
                          type="text"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-sm mb-3">Availability</h3>
                  <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg border border-slate-700">
                    <input
                      type="checkbox"
                      id="available"
                      checked={formData.available}
                      onChange={(e) => setFormData({ ...formData, available: e.target.checked })}
                      className="mt-0.5 w-4 h-4 rounded border-slate-600 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="available" className="text-slate-300 text-sm flex-1">
                      <div className="font-medium">Available for sale</div>
                      <div className="text-xs text-slate-400 mt-0.5">Unchecked items won't appear on POS</div>
                    </label>
                  </div>
                </div>

                <div>
                  <h3 className="text-white font-semibold text-sm mb-3">Pricing & Cost</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 text-xs mb-1.5 block">Price (MT)</label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-xs mb-1.5 block">Cost (MT)</label>
                      <input
                        type="number"
                        value={formData.cost}
                        onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {formData.price && formData.cost && formData.price > 0 && (
                    <div className="mt-2 p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Profit: <span className="text-emerald-400 font-semibold">{(formData.price - formData.cost).toFixed(2)} MT</span></span>
                        <span className="text-slate-400">Margin: <span className="text-emerald-400 font-semibold">{(((formData.price - formData.cost) / formData.price) * 100).toFixed(1)}%</span></span>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <h3 className="text-white font-semibold text-sm mb-3">Inventory</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-slate-300 text-xs mb-1.5 block">Current Stock</label>
                      <input
                        type="number"
                        value={formData.stockCount}
                        onChange={(e) => setFormData({ ...formData, stockCount: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Stock quantity"
                      />
                    </div>

                    <div>
                      <label className="text-slate-300 text-xs mb-1.5 block">Low Stock Alert</label>
                      <input
                        type="number"
                        value={formData.lowStockThreshold}
                        onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value) || 10 })}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        min="0"
                        placeholder="Alert threshold"
                      />
                    </div>
                  </div>
                  <p className="text-slate-500 text-xs mt-1.5">Alert when stock falls below threshold</p>
                </div>
              </div>

              <div className="flex-none border-t border-slate-700 p-4 flex gap-2">
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setEditingItem(null);
                    resetForm();
                  }}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editingItem ? handleUpdateItem : handleCreateItem}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingItem ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InventoryManagement;