import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft,
  Table as TableIcon,
  ClipboardList,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

// Mock table data
const mockTables = [
  { id: '1', number: '1', status: 'occupied', capacity: 4, currentGuests: 3 },
  { id: '2', number: '2', status: 'available', capacity: 2, currentGuests: 0 },
  { id: '3', number: '3', status: 'occupied', capacity: 6, currentGuests: 6 },
  { id: '4', number: '4', status: 'reserved', capacity: 4, currentGuests: 0 },
  { id: '5', number: '5', status: 'available', capacity: 2, currentGuests: 0 },
  { id: '6', number: '6', status: 'occupied', capacity: 4, currentGuests: 2 },
  { id: '7', number: '7', status: 'cleaning', capacity: 8, currentGuests: 0 },
  { id: '8', number: '8', status: 'available', capacity: 4, currentGuests: 0 },
];

const mockOrders = [
  { id: '1', table: '1', items: 3, status: 'preparing', time: '10min', total: 850 },
  { id: '2', table: '3', items: 5, status: 'ready', time: '5min', total: 1240 },
  { id: '3', table: '6', items: 2, status: 'pending', time: '2min', total: 420 },
];

const TabletWaiter = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedTab, setSelectedTab] = useState('tables');
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-accent text-accent-foreground';
      case 'occupied':
        return 'bg-destructive text-destructive-foreground';
      case 'reserved':
        return 'bg-secondary text-secondary-foreground';
      case 'cleaning':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted';
    }
  };

  const getOrderStatusIcon = (status: string) => {
    switch (status) {
      case 'preparing':
        return <Clock className="h-4 w-4" />;
      case 'ready':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'pending':
        return <AlertCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <header className="bg-card border-b shadow-soft">
        <div className="px-6 py-4 flex items-center justify-between">
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
              <h1 className="text-xl font-bold">{t('select.tablet')}</h1>
              <p className="text-sm text-muted-foreground">Waiter Interface</p>
            </div>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <div className="p-6">
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="tables" className="gap-2">
              <TableIcon className="h-4 w-4" />
              {t('nav.tables')}
            </TabsTrigger>
            <TabsTrigger value="orders" className="gap-2">
              <ClipboardList className="h-4 w-4" />
              {t('nav.orders')}
            </TabsTrigger>
          </TabsList>

          {/* Tables View */}
          <TabsContent value="tables" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {t('nav.tables')}
              </h2>
              <div className="flex gap-2">
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  {t('table.available')}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-destructive" />
                  {t('table.occupied')}
                </Badge>
                <Badge variant="outline" className="gap-1">
                  <div className="w-2 h-2 rounded-full bg-secondary" />
                  {t('table.reserved')}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {mockTables.map(table => (
                <Card
                  key={table.id}
                  className={cn(
                    "p-6 cursor-pointer hover:shadow-medium transition-all relative overflow-hidden group",
                    selectedTable === table.id && "ring-2 ring-primary"
                  )}
                  onClick={() => setSelectedTable(table.id)}
                >
                  <div className={cn(
                    "absolute top-0 right-0 w-16 h-16 rounded-bl-full transition-all",
                    getTableStatusColor(table.status)
                  )} />
                  
                  <div className="space-y-3 relative">
                    <div className="flex items-center gap-2">
                      <TableIcon className="h-5 w-5 text-muted-foreground" />
                      <span className="text-2xl font-bold">{table.number}</span>
                    </div>
                    
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-4 w-4" />
                        {table.currentGuests}/{table.capacity}
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {t(`table.${table.status}`)}
                      </Badge>
                    </div>
                  </div>

                  {table.status === 'occupied' && (
                    <Button
                      size="sm"
                      className="w-full mt-4 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        // Navigate to order for this table
                      }}
                    >
                      {t('order.new')}
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Orders View */}
          <TabsContent value="orders" className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-semibold">
                {t('dashboard.activeOrders')}
              </h2>
              <Button>
                {t('order.new')}
              </Button>
            </div>

            <div className="grid gap-4">
              {mockOrders.map(order => (
                <Card key={order.id} className="p-6 hover:shadow-medium transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-sm text-muted-foreground mb-1">
                          {t('table.number')}
                        </div>
                        <div className="text-3xl font-bold">{order.table}</div>
                      </div>
                      
                      <div className="h-12 w-px bg-border" />
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="gap-1">
                            {getOrderStatusIcon(order.status)}
                            {t(`order.${order.status}`)}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {order.items} items
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          {order.time}
                        </div>
                      </div>
                    </div>

                    <div className="text-right space-y-2">
                      <div className="text-2xl font-bold text-primary">
                        {order.total} MZN
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline">
                          {t('common.cancel')}
                        </Button>
                        <Button size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TabletWaiter;
