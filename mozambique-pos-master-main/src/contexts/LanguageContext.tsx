import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'pt' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  pt: {
    // Navigation
    'nav.home': 'Início',
    'nav.menu': 'Menu',
    'nav.orders': 'Pedidos',
    'nav.tables': 'Mesas',
    'nav.dashboard': 'Painel',
    'nav.settings': 'Configurações',
    
    // Interface Selection
    'select.title': 'Selecione a Interface',
    'select.subtitle': 'Escolha como deseja acessar o sistema',
    'select.mobile': 'Cliente Móvel',
    'select.mobile.desc': 'Visualize o menu e faça pedidos',
    'select.tablet': 'Garçom Tablet',
    'select.tablet.desc': 'Gerencie mesas e pedidos',
    'select.kiosk': 'Quiosque',
    'select.kiosk.desc': 'Autoatendimento',
    'select.staff': 'Painel Administrativo',
    'select.staff.desc': 'Gestão e relatórios',
    
    // Common
    'common.welcome': 'Bem-vindo',
    'common.search': 'Pesquisar',
    'common.filter': 'Filtrar',
    'common.add': 'Adicionar',
    'common.remove': 'Remover',
    'common.save': 'Salvar',
    'common.cancel': 'Cancelar',
    'common.confirm': 'Confirmar',
    'common.total': 'Total',
    'common.subtotal': 'Subtotal',
    'common.tax': 'IVA',
    'common.discount': 'Desconto',
    
    // Menu
    'menu.title': 'Menu',
    'menu.categories': 'Categorias',
    'menu.all': 'Todos',
    'menu.available': 'Disponível',
    'menu.unavailable': 'Indisponível',
    'menu.addToCart': 'Adicionar ao Carrinho',
    'menu.viewCart': 'Ver Carrinho',
    
    // Orders
    'order.new': 'Novo Pedido',
    'order.pending': 'Pendente',
    'order.preparing': 'Preparando',
    'order.ready': 'Pronto',
    'order.served': 'Servido',
    'order.completed': 'Concluído',
    'order.cancelled': 'Cancelado',
    
    // Tables
    'table.available': 'Disponível',
    'table.occupied': 'Ocupada',
    'table.reserved': 'Reservada',
    'table.cleaning': 'Limpeza',
    'table.number': 'Mesa',
    'table.capacity': 'Capacidade',
    
    // Dashboard
    'dashboard.title': 'Painel Administrativo',
    'dashboard.overview': 'Visão Geral',
    'dashboard.todaySales': 'Vendas Hoje',
    'dashboard.activeOrders': 'Pedidos Ativos',
    'dashboard.activeTables': 'Mesas Ativas',
    'dashboard.revenue': 'Receita',
  },
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.menu': 'Menu',
    'nav.orders': 'Orders',
    'nav.tables': 'Tables',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    
    // Interface Selection
    'select.title': 'Select Interface',
    'select.subtitle': 'Choose how you want to access the system',
    'select.mobile': 'Mobile Customer',
    'select.mobile.desc': 'Browse menu and place orders',
    'select.tablet': 'Waiter Tablet',
    'select.tablet.desc': 'Manage tables and orders',
    'select.kiosk': 'Kiosk',
    'select.kiosk.desc': 'Self-service ordering',
    'select.staff': 'Staff Dashboard',
    'select.staff.desc': 'Management and reports',
    
    // Common
    'common.welcome': 'Welcome',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.add': 'Add',
    'common.remove': 'Remove',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.total': 'Total',
    'common.subtotal': 'Subtotal',
    'common.tax': 'VAT',
    'common.discount': 'Discount',
    
    // Menu
    'menu.title': 'Menu',
    'menu.categories': 'Categories',
    'menu.all': 'All',
    'menu.available': 'Available',
    'menu.unavailable': 'Unavailable',
    'menu.addToCart': 'Add to Cart',
    'menu.viewCart': 'View Cart',
    
    // Orders
    'order.new': 'New Order',
    'order.pending': 'Pending',
    'order.preparing': 'Preparing',
    'order.ready': 'Ready',
    'order.served': 'Served',
    'order.completed': 'Completed',
    'order.cancelled': 'Cancelled',
    
    // Tables
    'table.available': 'Available',
    'table.occupied': 'Occupied',
    'table.reserved': 'Reserved',
    'table.cleaning': 'Cleaning',
    'table.number': 'Table',
    'table.capacity': 'Capacity',
    
    // Dashboard
    'dashboard.title': 'Staff Dashboard',
    'dashboard.overview': 'Overview',
    'dashboard.todaySales': 'Today\'s Sales',
    'dashboard.activeOrders': 'Active Orders',
    'dashboard.activeTables': 'Active Tables',
    'dashboard.revenue': 'Revenue',
  },
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('preferredLanguage');
    return (saved as Language) || 'pt';
  });

  useEffect(() => {
    localStorage.setItem('preferredLanguage', language);
  }, [language]);

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
};
