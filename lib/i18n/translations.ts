export const translations = {
  en: {
    // Common
    welcome: "Welcome",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    cancel: "Cancel",
    confirm: "Confirm",
    save: "Save",
    delete: "Delete",
    edit: "Edit",
    back: "Back",
    next: "Next",
    submit: "Submit",
    search: "Search",

    // Navigation
    home: "Home",
    menu: "Menu",
    orders: "Orders",
    profile: "Profile",
    logout: "Logout",

    // Menu Categories
    beers: "Beers",
    ciders: "Ciders",
    cocktails: "Cocktails",
    shots: "Shots",
    liqueurs: "Liqueurs",
    bottles: "Bottles",
    food: "Food",

    // Order
    cart: "Cart",
    addToCart: "Add to Cart",
    removeFromCart: "Remove",
    clearCart: "Clear Cart",
    checkout: "Checkout",
    total: "Total",
    subtotal: "Subtotal",
    orderConfirmed: "Order Confirmed",
    orderPending: "Order Pending",
    orderFailed: "Order Failed",

    // Wallet
    balance: "Balance",
    insufficientBalance: "Insufficient Balance",
    walletActivated: "Wallet Activated",
    scanVoucher: "Scan Voucher",

    // Table
    table: "Table",
    tables: "Tables",
    tableNumber: "Table Number",
    selectTable: "Select Table",
    tableStatus: "Table Status",
    free: "Free",
    occupied: "Occupied",
    reserved: "Reserved",

    // Staff
    staff: "Staff",
    waiter: "Waiter",
    bartender: "Bartender",
    manager: "Manager",
    cashier: "Cashier",
    admin: "Admin",

    // Dashboard
    dashboard: "Dashboard",
    todaySales: "Today's Sales",
    activeOrders: "Active Orders",
    totalOrders: "Total Orders",
    averageOrder: "Average Order",

    // POS
    posSystem: "POS System",
    clientInfo: "Client Information",
    enterPhone: "Enter phone number",
    searchClient: "Search Client",
    createOrder: "Create Order",
    sendToClient: "Send to Client",

    // Modifiers
    modifiers: "Modifiers",
    specialNotes: "Special Notes",
    customize: "Customize",
    noOnions: "No onions",
    extraCheese: "Extra cheese",
    noIce: "No ice",
    extraIce: "Extra ice",
    lessSugar: "Less sugar",
    extraSpicy: "Extra spicy",

    // Status
    pending: "Pending",
    preparing: "Preparing",
    ready: "Ready",
    completed: "Completed",
    cancelled: "Cancelled",

    // Messages
    orderCreatedSuccess: "Order created successfully",
    orderConfirmationTimeout: "Order confirmation timeout",
    walletNotFound: "Wallet not found",
    invalidCredentials: "Invalid credentials",
    sessionExpired: "Session expired",
  },
  pt: {
    // Common
    welcome: "Bem-vindo",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    cancel: "Cancelar",
    confirm: "Confirmar",
    save: "Guardar",
    delete: "Eliminar",
    edit: "Editar",
    back: "Voltar",
    next: "Próximo",
    submit: "Enviar",
    search: "Pesquisar",

    // Navigation
    home: "Início",
    menu: "Menu",
    orders: "Pedidos",
    profile: "Perfil",
    logout: "Sair",

    // Menu Categories
    beers: "Cervejas",
    ciders: "Cidras",
    cocktails: "Coquetéis",
    shots: "Shots",
    liqueurs: "Licores",
    bottles: "Garrafas",
    food: "Comida",

    // Order
    cart: "Carrinho",
    addToCart: "Adicionar ao Carrinho",
    removeFromCart: "Remover",
    clearCart: "Limpar Carrinho",
    checkout: "Finalizar",
    total: "Total",
    subtotal: "Subtotal",
    orderConfirmed: "Pedido Confirmado",
    orderPending: "Pedido Pendente",
    orderFailed: "Pedido Falhou",

    // Wallet
    balance: "Saldo",
    insufficientBalance: "Saldo Insuficiente",
    walletActivated: "Carteira Ativada",
    scanVoucher: "Escanear Voucher",

    // Table
    table: "Mesa",
    tables: "Mesas",
    tableNumber: "Número da Mesa",
    selectTable: "Selecionar Mesa",
    tableStatus: "Estado da Mesa",
    free: "Livre",
    occupied: "Ocupada",
    reserved: "Reservada",

    // Staff
    staff: "Pessoal",
    waiter: "Empregado",
    bartender: "Barman",
    manager: "Gerente",
    cashier: "Caixa",
    admin: "Administrador",

    // Dashboard
    dashboard: "Painel",
    todaySales: "Vendas de Hoje",
    activeOrders: "Pedidos Ativos",
    totalOrders: "Total de Pedidos",
    averageOrder: "Pedido Médio",

    // POS
    posSystem: "Sistema POS",
    clientInfo: "Informação do Cliente",
    enterPhone: "Digite o número de telefone",
    searchClient: "Pesquisar Cliente",
    createOrder: "Criar Pedido",
    sendToClient: "Enviar ao Cliente",

    // Modifiers
    modifiers: "Modificadores",
    specialNotes: "Notas Especiais",
    customize: "Personalizar",
    noOnions: "Sem cebola",
    extraCheese: "Queijo extra",
    noIce: "Sem gelo",
    extraIce: "Gelo extra",
    lessSugar: "Menos açúcar",
    extraSpicy: "Extra picante",

    // Status
    pending: "Pendente",
    preparing: "Preparando",
    ready: "Pronto",
    completed: "Concluído",
    cancelled: "Cancelado",

    // Messages
    orderCreatedSuccess: "Pedido criado com sucesso",
    orderConfirmationTimeout: "Tempo de confirmação esgotado",
    walletNotFound: "Carteira não encontrada",
    invalidCredentials: "Credenciais inválidas",
    sessionExpired: "Sessão expirada",
  },
}

export type Language = keyof typeof translations
export type TranslationKey = keyof typeof translations.en
