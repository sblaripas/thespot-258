import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  ArrowLeft,
  TrendingUp,
  Users,
  ShoppingBag,
  DollarSign,
  Table as TableIcon,
  Clock,
  ChefHat,
  BarChart3
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const StaffDashboard = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const stats = [
    {
      label: t('dashboard.todaySales'),
      value: '12,450 MZN',
      change: '+12.5%',
      icon: DollarSign,
      gradient: 'from-primary to-primary-light',
    },
    {
      label: t('dashboard.activeOrders'),
      value: '23',
      change: '8 pending',
      icon: ShoppingBag,
      gradient: 'from-secondary to-secondary-light',
    },
    {
      label: t('dashboard.activeTables'),
      value: '15/30',
      change: '50% occupied',
      icon: TableIcon,
      gradient: 'from-accent to-emerald-500',
    },
    {
      label: 'Staff Online',
      value: '8',
      change: '2 waiters',
      icon: Users,
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  const recentOrders = [
    { id: '#1234', table: '5', items: 3, status: 'preparing', time: '5min ago', amount: 850 },
    { id: '#1235', table: '12', items: 5, status: 'ready', time: '2min ago', amount: 1240 },
    { id: '#1236', table: '3', items: 2, status: 'served', time: '15min ago', amount: 420 },
    { id: '#1237', table: '8', items: 4, status: 'preparing', time: '8min ago', amount: 680 },
  ];

  const topItems = [
    { name_pt: 'Frango Piri-Piri', name_en: 'Piri-Piri Chicken', orders: 45, revenue: 17100 },
    { name_pt: 'Camarão Grelhado', name_en: 'Grilled Prawns', orders: 32, revenue: 14400 },
    { name_pt: 'Matapa', name_en: 'Matapa', orders: 28, revenue: 8960 },
  ];

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b shadow-soft sticky top-0 z-50">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/')}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                {t('common.welcome')}
              </Button>
              <div className="h-8 w-px bg-border" />
              <div>
                <h1 className="text-xl font-bold">{t('dashboard.title')}</h1>
                <p className="text-sm text-muted-foreground">Real-time Analytics & Management</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline">
                <Clock className="h-4 w-4 mr-2" />
                Today: 08:00 - 22:00
              </Button>
              <LanguageToggle />
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 hover:shadow-medium transition-all animate-slide-up"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-soft`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center gap-1 text-accent text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  {stat.change}
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
              </div>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Orders */}
          <Card className="lg:col-span-2 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5 text-primary" />
                <h2 className="text-xl font-semibold">Recent Orders</h2>
              </div>
              <Button variant="outline" size="sm">
                View All
              </Button>
            </div>
            <div className="space-y-3">
              {recentOrders.map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-xs text-muted-foreground">Table</div>
                      <div className="text-lg font-bold">{order.table}</div>
                    </div>
                    <div>
                      <div className="font-semibold">{order.id}</div>
                      <div className="text-sm text-muted-foreground">
                        {order.items} items • {order.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-primary">
                      {order.amount} MZN
                    </span>
                    <Button size="sm" variant="outline">
                      {order.status}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Top Menu Items */}
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">Top Items</h2>
            </div>
            <div className="space-y-4">
              {topItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold">
                        {item[`name_${t('common.welcome') === 'Welcome' ? 'en' : 'pt'}` as keyof typeof item]}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {item.orders} orders
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-primary">
                        {item.revenue} MZN
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-gradient-sunset rounded-full transition-all"
                      style={{ width: `${(item.orders / 50) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default StaffDashboard;
