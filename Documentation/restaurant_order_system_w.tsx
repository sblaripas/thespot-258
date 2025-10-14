import React, { useState, useEffect } from 'react';
import { Search, ChefHat, Users, DollarSign, Clock, User, Check, X, ShoppingCart, AlertCircle } from 'lucide-react';

// Generate unique client ID - persists across sessions
const getClientId = () => {
  let stored = localStorage.getItem('restaurantClientId');
  if (stored) return stored;
  
  const newId = 'CLIENT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
  localStorage.setItem('restaurantClientId', newId);
  return newId;
};

// Data structures
const menu = [
  { name: "2M", category: "CERVEJAS", size: "550ml", price: 130 },
  { name: "2M Txoti", category: "CERVEJAS", size: "250ml", price: 120 },
  { name: "HEINEKEN", category: "CERVEJAS", size: "210ml", price: 130 },
  { name: "TXILAR", category: "CERVEJAS", size: "330ml", price: 120 },
  { name: "MANICA", category: "CERVEJAS", size: "330ml", price: 120 },
  { name: "CASTLE LITE", category: "CERVEJAS", size: "330ml", price: 130 },
  { name: "CORONA", category: "CERVEJAS", size: "355ml", price: 150 },
  { name: "LAURENTINA PRETA TXOTI", category: "CERVEJAS", size: "250ml", price: 120 },
  { name: "FLYING FISH", category: "CIDRAS", price: 150 },
  { name: "SAVANNA DRY", category: "CIDRAS", price: 180 },
  { name: "SAVANNA LEMON", category: "CIDRAS", price: 180 },
  { name: "BERNIN", category: "CIDRAS", price: 180 },
  { name: "BERNINI 500ML", category: "CIDRAS", price: 200 },
  { name: "BRUTAL", category: "CIDRAS", price: 180 },
  { name: "J.C A LATA", category: "CIDRAS", price: 200 },
  { name: "CAIPIRINHA DE LIMÃO", category: "COCKTAILS", price: 250 },
  { name: "CAIPIRINHA DE MARACUJÁ", category: "COCKTAILS", price: 250 },
  { name: "CAIPIRINHA DE FRUTOS VERMELHOS", category: "COCKTAILS", price: 250 },
  { name: "GIN & TONIC", category: "COCKTAILS", price: 380 },
  { name: "MAGNUM SPECIAL", category: "COCKTAILS", price: 500 },
  { name: "STRAWBERRY DAIQUIRI", category: "COCKTAILS", price: 400 },
  { name: "THAI COCKTAIL", category: "COCKTAILS", price: 400 },
  { name: "PORN STAR MARTINI", category: "COCKTAILS", price: 300 },
  { name: "MARGARITA", category: "COCKTAILS", price: 300 },
  { name: "PINA COLADA", category: "COCKTAILS", price: 400 },
  { name: "SEX ON THE BEACH", category: "COCKTAILS", price: 400 },
  { name: "TEQUILA SUNRISE", category: "COCKTAILS", price: 350 },
  { name: "COSMOPOLITAN", category: "COCKTAILS", price: 350 },
  { name: "RICKEY", category: "COCKTAILS", price: 300 },
  { name: "KAMIKAZE", category: "COCKTAILS", price: 400 },
  { name: "ESPRESSO MARTINI", category: "COCKTAILS", price: 350 },
  { name: "PURPLE RAIN", category: "COCKTAILS", price: 350 },
  { name: "WHISKEY SOUR", category: "COCKTAILS", price: 350 },
  { name: "LONG ISLAND ICED TEA", category: "COCKTAILS", price: 400 },
  { name: "COCKTAIL ON THE SPOT", category: "COCKTAILS", price: 300 },
  { name: "MOJITO", category: "COCKTAILS", price: 300 },
  { name: "GIN & TONIC PROMO", category: "COCKTAILS", price: 300 },
  { name: "BOB MARLEY", category: "SHOTS", price: 300 },
  { name: "BLOW JOB", category: "SHOTS", price: 300 },
  { name: "JAGER BOMB", category: "SHOTS", price: 400 },
  { name: "TEQUILA JOSE CUERVO", category: "SHOTS", price: 200 },
  { name: "TEQUILA OLMECA", category: "SHOTS", price: 250 },
  { name: "JAGERMISTER", category: "SHOTS", price: 200 },
  { name: "SHOT ON THE SPOT", category: "SHOTS", price: 250 },
  { name: "LICOR SIMPLES", category: "LICOR", price: 150 },
  { name: "MARTINI SIMPLES", category: "LICOR", price: 150 },
  { name: "AMARULA SIMPLES", category: "LICOR", price: 180 },
  { name: "AMARULA", category: "LICOR", price: 1500 },
  { name: "1920 SIMPLES", category: "DIGESTIVO", price: 180 },
  { name: "SAO DOMINGOS SIMPLES", category: "DIGESTIVO", price: 150 },
  { name: "SANGRIA TINTO", category: "SANGRIA", price: 1100 },
  { name: "SANGRIA BRANCA", category: "SANGRIA", price: 1100 },
  { name: "TAÇA DO VINHO DA CASA", category: "SANGRIA", price: 300 },
  { name: "BEEFEATER PINK SIMPLES", category: "SECAS", price: 200 },
  { name: "BEEFEATER BRANCA", category: "SECAS", price: 180 },
  { name: "JAMESON SIMPLES", category: "SECAS", price: 200 },
  { name: "TANQUERAY SIMPLES", category: "SECAS", price: 200 },
  { name: "JOHNNIE WALKER SIMPLES", category: "SECAS", price: 200 },
  { name: "GORDON PINK SIMPLES", category: "SECAS", price: 130 },
  { name: "JAMESON", category: "GARRAFAS", price: 3000 },
  { name: "JOHNNIE WALKER", category: "GARRAFAS", price: 3200 },
  { name: "BEEFEATER BRANCA", category: "GARRAFAS", price: 2500 },
  { name: "BEEFEATER PINK", category: "GARRAFAS", price: 2700 },
  { name: "TANQUERAY", category: "GARRAFAS", price: 3000 },
  { name: "GORDON PINK", category: "GARRAFAS", price: 1500 },
  { name: "JAGERMISTER", category: "GARRAFAS", price: 3000 },
  { name: "JOSE CUERVO", category: "GARRAFAS", price: 2000 },
  { name: "OLMECA", category: "GARRAFAS", price: 2500 },
];

const WAITERS = ['Robert', 'Joaquim', 'Ana'];

const WaiterView = ({ orders, setOrders, waiterName, setWaiterName }) => {
  const [selectedTable, setSelectedTable] = useState(null);

  const pendingOrders = orders.filter(o => o.status === 'pending');
  const confirmedOrders = orders.filter(o => o.status === 'confirmed');

  const handleConfirmOrder = (orderId, table) => {
    if (!waiterName) {
      alert('Please select your name first');
      return;
    }
    
    setOrders(orders.map(o => 
      o.orderId === orderId 
        ? { ...o, status: 'confirmed', confirmedBy: waiterName, confirmedTable: table, confirmedAt: new Date().toISOString() }
        : o
    ));
  };

  const handleRejectOrder = (orderId) => {
    if (!waiterName) {
      alert('Please select your name first');
      return;
    }
    
    setOrders(orders.map(o => 
      o.orderId === orderId 
        ? { ...o, status: 'rejected', rejectedBy: waiterName, rejectedAt: new Date().toISOString() }
        : o
    ));
  };

  const tableOrders = selectedTable 
    ? confirmedOrders.filter(o => o.confirmedTable === selectedTable)
    : [];

  const tables = [...new Set(confirmedOrders.map(o => o.confirmedTable))].sort((a, b) => a - b);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <ChefHat className="w-8 h-8 text-emerald-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Waiter Dashboard</h1>
          </div>
          
          <div className="flex gap-2 mb-4">
            {WAITERS.map(name => (
              <button
                key={name}
                onClick={() => setWaiterName(name)}
                className={`px-4 py-2 rounded-lg transition-all ${
                  waiterName === name
                    ? 'bg-emerald-500 text-white shadow-lg'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {name}
              </button>
            ))}
          </div>
          
          {waiterName && (
            <p className="text-emerald-400">Logged in as: {waiterName}</p>
          )}
        </div>

        {pendingOrders.length > 0 && (
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-amber-400" />
              Pending Orders ({pendingOrders.length})
            </h2>
            <div className="grid gap-4">
              {pendingOrders.map(order => (
                <div key={order.orderId} className="bg-amber-900/30 border-2 border-amber-500 rounded-xl p-4 shadow-xl">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="text-amber-400 font-semibold text-lg mb-1">
                        Client: {order.clientId.slice(-8)}
                      </div>
                      <div className="text-slate-400 text-sm">
                        Requested Table: {order.requestedTable}
                      </div>
                      <div className="text-slate-500 text-xs">{formatTime(order.timestamp)}</div>
                    </div>
                    <div className="text-amber-400 font-bold text-xl">{order.total} MT</div>
                  </div>
                  
                  <div className="space-y-2 border-t border-amber-700/50 pt-3 mb-4">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          {item.quantity}x {item.item.name}
                          {item.item.size && ` (${item.item.size})`}
                        </span>
                        <span className="text-slate-400">{item.item.price * item.quantity} MT</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="20"
                      defaultValue={order.requestedTable}
                      id={`table-${order.orderId}`}
                      className="w-24 px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white"
                      placeholder="Table"
                    />
                    <button
                      onClick={() => {
                        const tableInput = document.getElementById(`table-${order.orderId}`);
                        handleConfirmOrder(order.orderId, parseInt(tableInput.value));
                      }}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <Check className="w-5 h-5" />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleRejectOrder(order.orderId)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
                    >
                      <X className="w-5 h-5" />
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <h2 className="text-2xl font-bold text-white mb-4">Confirmed Orders by Table</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3 mb-8">
          {tables.map(table => {
            const tableOrdersCount = confirmedOrders.filter(o => o.confirmedTable === table).length;
            const tableTotal = confirmedOrders
              .filter(o => o.confirmedTable === table)
              .reduce((sum, o) => sum + o.total, 0);
            
            return (
              <button
                key={table}
                onClick={() => setSelectedTable(table)}
                className={`p-4 rounded-xl transition-all duration-200 ${
                  selectedTable === table
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <div className="text-2xl font-bold mb-1">Table {table}</div>
                <div className="text-sm opacity-80">{tableOrdersCount} orders</div>
                <div className="text-xs opacity-60 mt-1">{tableTotal} MT</div>
              </button>
            );
          })}
        </div>

        {selectedTable ? (
          <div className="space-y-6">
            <div className="bg-slate-800 rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">
                Table {selectedTable} Orders
              </h2>
              
              {tableOrders.map(order => (
                <div key={order.orderId} className="bg-slate-700 rounded-lg p-4 mb-3">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <User className="w-4 h-4 text-emerald-400" />
                        <span className="text-white font-semibold">Client: {order.clientId.slice(-8)}</span>
                      </div>
                      <div className="text-emerald-400 text-sm mb-1">Confirmed by: {order.confirmedBy}</div>
                      <div className="flex items-center gap-2 text-slate-400 text-xs">
                        <Clock className="w-3 h-3" />
                        {formatTime(order.confirmedAt)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-emerald-400 font-bold text-xl">{order.total} MT</div>
                      <div className="text-slate-500 text-xs">{order.orderId}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2 border-t border-slate-600 pt-3">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-slate-300">
                          {item.quantity}x {item.item.name}
                          {item.item.size && ` (${item.item.size})`}
                        </span>
                        <span className="text-slate-400">{item.item.price * item.quantity} MT</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-xl p-6 shadow-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <DollarSign className="w-8 h-8 text-white" />
                  <div>
                    <div className="text-emerald-100 text-sm">Table {selectedTable} Total</div>
                    <div className="text-white text-3xl font-bold">
                      {tableOrders.reduce((sum, o) => sum + o.total, 0)} MT
                    </div>
                  </div>
                </div>
                <div className="text-right text-emerald-100">
                  <div className="text-sm">Total Orders</div>
                  <div className="text-2xl font-bold">{tableOrders.length}</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-800 rounded-xl p-12 text-center shadow-xl">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 text-lg">Select a table to view confirmed orders</p>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerView = ({ orders, setOrders }) => {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrders, setShowOrders] = useState(false);
  const [customerTable, setCustomerTable] = useState(null);
  const [showTableSelector, setShowTableSelector] = useState(true);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [clientId] = useState(getClientId());

  useEffect(() => {
    const savedTable = localStorage.getItem('customerTable-' + clientId);
    if (savedTable) {
      setCustomerTable(parseInt(savedTable));
      setShowTableSelector(false);
    }
  }, [clientId]);

  const handleTableSelect = (table) => {
    setCustomerTable(table);
    localStorage.setItem('customerTable-' + clientId, table.toString());
    setShowTableSelector(false);
  };

  const changeTable = () => {
    setShowTableSelector(true);
    setCustomerTable(null);
    localStorage.removeItem('customerTable-' + clientId);
  };

  const addToCart = (item) => {
    const existing = cart.find(c => c.item.name === item.name);
    if (existing) {
      setCart(cart.map(c => 
        c.item.name === item.name 
          ? { ...c, quantity: c.quantity + 1 }
          : c
      ));
    } else {
      setCart([...cart, { item, quantity: 1 }]);
    }
    setShowCart(true);
  };

  const updateCartQuantity = (itemName, delta) => {
    setCart(cart.map(c => 
      c.item.name === itemName
        ? { ...c, quantity: Math.max(0, c.quantity + delta) }
        : c
    ).filter(c => c.quantity > 0));
  };

  const placeOrder = () => {
    if (cart.length === 0) return;
    
    const total = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);
    const newOrder = {
      clientId,
      orderId: `ORD${Date.now()}`,
      requestedTable: customerTable,
      items: cart,
      total,
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    setOrders([...orders, newOrder]);
    setCart([]);
    setShowCart(false);
    alert('Order placed! Waiting for waiter confirmation...');
  };

  const categories = ['ALL', ...new Set(menu.map(item => item.category))];
  
  const filteredMenu = menu.filter(item => {
    const matchesCategory = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const myOrders = orders.filter(o => o.clientId === clientId);
  const totalAmount = myOrders.filter(o => o.status === 'confirmed').reduce((sum, o) => sum + o.total, 0);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-PT', { 
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (showTableSelector) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 flex items-center justify-center">
        <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 shadow-xl max-w-md w-full">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Select Your Table</h2>
          <p className="text-purple-200 text-center mb-6">Choose the table number where you are seated</p>
          <div className="grid grid-cols-4 gap-3">
            {[...Array(20)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handleTableSelect(i + 1)}
                className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-4 rounded-lg transition-colors text-xl"
              >
                {i + 1}
              </button>
            ))}
          </div>
          <p className="text-purple-300 text-sm text-center mt-6">
            Your device ID: {clientId.slice(-8)}
          </p>
        </div>
      </div>
    );
  }

  const cartTotal = cart.reduce((sum, c) => sum + (c.item.price * c.quantity), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900 p-4 pb-24">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat className="w-8 h-8 text-purple-300" />
              <div>
                <h1 className="text-3xl font-bold text-white">Menu</h1>
                <div className="flex items-center gap-2">
                  <p className="text-purple-200 text-sm">Table {customerTable}</p>
                  <button 
                    onClick={changeTable}
                    className="text-purple-300 hover:text-white text-xs underline"
                  >
                    (change)
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowOrders(!showOrders)}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <User className="w-5 h-5" />
              My Orders
            </button>
          </div>
        </div>

        {showOrders ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowOrders(false)}
              className="text-purple-300 hover:text-white mb-4"
            >
              ← Back to Menu
            </button>

            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-white mb-4">Your Orders</h2>
              
              {myOrders.length > 0 ? (
                <div className="space-y-4">
                  {myOrders.map(order => (
                    <div key={order.orderId} className={`rounded-lg p-4 ${
                      order.status === 'pending' ? 'bg-amber-900/30 border border-amber-500' :
                      order.status === 'confirmed' ? 'bg-emerald-900/30 border border-emerald-500' :
                      'bg-red-900/30 border border-red-500'
                    }`}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <div className={`font-semibold mb-1 ${
                            order.status === 'pending' ? 'text-amber-400' :
                            order.status === 'confirmed' ? 'text-emerald-400' :
                            'text-red-400'
                          }`}>
                            {order.status === 'pending' ? '⏳ Pending Confirmation' :
                             order.status === 'confirmed' ? `✓ Confirmed - Table ${order.confirmedTable}` :
                             '✗ Rejected'}
                          </div>
                          <div className="text-purple-300 text-sm">{formatTime(order.timestamp)}</div>
                          {order.confirmedBy && (
                            <div className="text-purple-200 text-xs">Waiter: {order.confirmedBy}</div>
                          )}
                        </div>
                        <div className="text-purple-300 font-bold text-xl">{order.total} MT</div>
                      </div>
                      
                      <div className="space-y-2 border-t border-white/10 pt-3">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between text-sm">
                            <span className="text-purple-100">
                              {item.quantity}x {item.item.name}
                              {item.item.size && ` (${item.item.size})`}
                            </span>
                            <span className="text-purple-200">{item.item.price * item.quantity} MT</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-white font-semibold text-lg">Confirmed Total</span>
                      <span className="text-white font-bold text-2xl">{totalAmount} MT</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-purple-300 text-center py-8">No orders yet</p>
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-300 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search menu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-lg border border-purple-400/30 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-6">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedCategory === cat
                      ? 'bg-purple-500 text-white shadow-lg'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid gap-4 mb-24">
              {filteredMenu.map((item, idx) => (
                <div key={idx} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 shadow-lg hover:bg-white/15 transition-all">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold text-lg">{item.name}</h3>
                      <p className="text-purple-300 text-sm">{item.category}</p>
                      {item.size && <p className="text-purple-400 text-xs mt-1">{item.size}</p>}
                    </div>
                    <div className="text-right flex items-center gap-3">
                      <div className="text-purple-300 font-bold text-xl">{item.price} MT</div>
                      <button
                        onClick={() => addToCart(item)}
                        className="bg-purple-600 hover:bg-purple-700 text-white p-2 rounded-lg transition-colors"
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {showCart && cart.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-purple-500 p-4 shadow-2xl">
            <div className="max-w-4xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-white font-bold text-lg">Shopping Cart</h3>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-purple-300 hover:text-white"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
              
              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {cart.map((cartItem, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded-lg">
                    <div className="flex-1">
                      <div className="text-white font-semibold">{cartItem.item.name}</div>
                      {cartItem.item.size && <div className="text-purple-300 text-xs">{cartItem.item.size}</div>}
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => updateCartQuantity(cartItem.item.name, -1)}
                        className="bg-slate-700 hover:bg-slate-600 text-white w-8 h-8 rounded-lg flex items-center justify-center"
                      >
                        -
                      </button>
                      <span className="text-white font-bold w-8 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateCartQuantity(cartItem.item.name, 1)}
                        className="bg-slate-700 hover:bg-slate-600 text-white w-8 h-8 rounded-lg flex items-center justify-center"
                      >
                        +
                      </button>
                      <span className="text-purple-300 font-bold w-20 text-right">
                        {cartItem.item.price * cartItem.quantity} MT
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-bold text-xl">Total:</span>
                <span className="text-purple-300 font-bold text-2xl">{cartTotal} MT</span>
              </div>

              <button
                onClick={placeOrder}
                className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white py-3 rounded-lg font-bold text-lg transition-all"
              >
                Place Order
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [viewMode, setViewMode] = useState('customer');
  const [orders, setOrders] = useState([]);
  const [waiterName, setWaiterName] = useState('');

  return (
    <div>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button
          onClick={() => setViewMode('customer')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'customer'
              ? 'bg-purple-600 text-white shadow-lg'
              : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          Customer View
        </button>
        <button
          onClick={() => setViewMode('waiter')}
          className={`px-4 py-2 rounded-lg font-semibold transition-all ${
            viewMode === 'waiter'
              ? 'bg-emerald-600 text-white shadow-lg'
              : 'bg-white text-slate-800 hover:bg-slate-100'
          }`}
        >
          Waiter View
        </button>
      </div>

      {viewMode === 'customer' ? (
        <CustomerView orders={orders} setOrders={setOrders} />
      ) : (
        <WaiterView 
          orders={orders} 
          setOrders={setOrders}
          waiterName={waiterName}
          setWaiterName={setWaiterName}
        />
      )}
    </div>
  );
}