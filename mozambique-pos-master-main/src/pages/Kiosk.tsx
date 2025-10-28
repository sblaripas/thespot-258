import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Home,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Banknote,
  Smartphone
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mock data (same as mobile)
const mockCategories = [
  { id: '1', name_pt: 'Entradas', name_en: 'Starters' },
  { id: '2', name_pt: 'Pratos Principais', name_en: 'Main Courses' },
  { id: '3', name_pt: 'Sobremesas', name_en: 'Desserts' },
  { id: '4', name_pt: 'Bebidas', name_en: 'Drinks' },
];

const mockMenuItems = [
  {
    id: '1',
    name_pt: 'Camarão Grelhado',
    name_en: 'Grilled Prawns',
    category_id: '1',
    selling_price: 450,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
  },
  {
    id: '2',
    name_pt: 'Frango Piri-Piri',
    name_en: 'Piri-Piri Chicken',
    category_id: '2',
    selling_price: 380,
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
  },
  {
    id: '3',
    name_pt: 'Matapa',
    name_en: 'Matapa',
    category_id: '2',
    selling_price: 320,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
  },
  {
    id: '4',
    name_pt: 'Pudim de Coco',
    name_en: 'Coconut Pudding',
    category_id: '3',
    selling_price: 150,
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400',
  },
];

const Kiosk = () => {
  const { t, language, setLanguage } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<string>('1');
  const [cart, setCart] = useState<Record<string, number>>({});
  const [showPayment, setShowPayment] = useState(false);

  const filteredItems = mockMenuItems.filter(item => item.category_id === selectedCategory);
  const cartCount = Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  const cartTotal = mockMenuItems.reduce((sum, item) => {
    const qty = cart[item.id] || 0;
    return sum + (item.selling_price * qty);
  }, 0);

  const updateCart = (itemId: string, change: number) => {
    setCart(prev => {
      const newQty = (prev[itemId] || 0) + change;
      if (newQty <= 0) {
        const { [itemId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [itemId]: newQty };
    });
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-background via-muted/20 to-primary/5 overflow-hidden">
      {/* Kiosk Header - Full width, prominent */}
      <header className="bg-gradient-sunset text-primary-foreground shadow-strong">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="secondary"
                size="lg"
                className="gap-2"
                onClick={() => window.location.href = '/'}
              >
                <Home className="h-6 w-6" />
                {t('nav.home')}
              </Button>
              <div className="h-12 w-px bg-primary-foreground/20" />
              <div>
                <h1 className="text-3xl font-bold">RestaurantOS Kiosk</h1>
                <p className="text-primary-foreground/90">{t('select.kiosk.desc')}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setLanguage('pt')}
                className={cn(language === 'pt' && 'ring-2 ring-primary-foreground')}
              >
                Português
              </Button>
              <Button
                variant="secondary"
                size="lg"
                onClick={() => setLanguage('en')}
                className={cn(language === 'en' && 'ring-2 ring-primary-foreground')}
              >
                English
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        {/* Left: Categories & Items */}
        <div className="flex-1 flex overflow-hidden">
          {/* Categories Sidebar */}
          <div className="w-64 bg-card border-r p-4 space-y-2 overflow-y-auto">
            <h3 className="font-semibold text-lg mb-4 px-2">{t('menu.categories')}</h3>
            {mockCategories.map(cat => (
              <Button
                key={cat.id}
                variant={selectedCategory === cat.id ? 'default' : 'ghost'}
                className="w-full justify-start text-lg h-auto py-4"
                onClick={() => setSelectedCategory(cat.id)}
              >
                {cat[`name_${language}` as keyof typeof cat]}
              </Button>
            ))}
          </div>

          {/* Menu Items Grid */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="grid grid-cols-3 gap-6">
              {filteredItems.map(item => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-strong transition-all cursor-pointer group"
                  onClick={() => updateCart(item.id, 1)}
                >
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={item.image_url}
                      alt={item[`name_${language}` as keyof typeof item] as string}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-slow"
                    />
                    {cart[item.id] && (
                      <Badge className="absolute top-3 right-3 text-lg px-3 py-1">
                        {cart[item.id]}
                      </Badge>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <h3 className="font-semibold text-xl line-clamp-1">
                      {item[`name_${language}` as keyof typeof item]}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-2xl font-bold text-primary">
                        {item.selling_price} MZN
                      </span>
                      <Plus className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="w-96 bg-card border-l flex flex-col">
          <div className="p-6 border-b">
            <div className="flex items-center gap-3 mb-2">
              <ShoppingCart className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold">{t('menu.viewCart')}</h2>
            </div>
            <p className="text-muted-foreground">
              {cartCount} {cartCount === 1 ? 'item' : 'items'}
            </p>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-3">
            {Object.entries(cart).map(([itemId, qty]) => {
              const item = mockMenuItems.find(i => i.id === itemId);
              if (!item) return null;
              
              return (
                <Card key={itemId} className="p-4">
                  <div className="flex gap-3">
                    <img
                      src={item.image_url}
                      alt={item[`name_${language}` as keyof typeof item] as string}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold truncate">
                        {item[`name_${language}` as keyof typeof item]}
                      </h4>
                      <p className="text-sm text-primary font-semibold">
                        {item.selling_price} MZN
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCart(itemId, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">{qty}</span>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCart(itemId, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          <div className="p-6 border-t space-y-4 bg-muted/30">
            <div className="space-y-2">
              <div className="flex justify-between text-lg">
                <span>{t('common.subtotal')}</span>
                <span className="font-semibold">{cartTotal} MZN</span>
              </div>
              <div className="flex justify-between text-lg">
                <span>{t('common.tax')} (17%)</span>
                <span className="font-semibold">{Math.round(cartTotal * 0.17)} MZN</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-2xl font-bold">
                <span>{t('common.total')}</span>
                <span className="text-primary">{Math.round(cartTotal * 1.17)} MZN</span>
              </div>
            </div>

            <Button
              size="lg"
              className="w-full text-xl h-16"
              disabled={cartCount === 0}
              onClick={() => setShowPayment(true)}
            >
              <CreditCard className="mr-2 h-6 w-6" />
              {t('common.confirm')} & Pay
            </Button>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" size="sm" className="gap-1">
                <CreditCard className="h-4 w-4" />
                Card
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Banknote className="h-4 w-4" />
                Cash
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Smartphone className="h-4 w-4" />
                M-Pesa
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Kiosk;
