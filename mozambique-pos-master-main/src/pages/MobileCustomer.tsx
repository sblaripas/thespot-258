import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  ShoppingCart, 
  ArrowLeft,
  Plus,
  Minus,
  Filter
} from "lucide-react";
import { useNavigate } from "react-router-dom";

// Mock menu data
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
    description_pt: 'Camarão fresco grelhado com limão',
    description_en: 'Fresh prawns grilled with lemon',
    category_id: '1',
    selling_price: 450,
    image_url: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400',
    is_available: true,
  },
  {
    id: '2',
    name_pt: 'Frango Piri-Piri',
    name_en: 'Piri-Piri Chicken',
    description_pt: 'Frango grelhado com molho piri-piri',
    description_en: 'Grilled chicken with piri-piri sauce',
    category_id: '2',
    selling_price: 380,
    image_url: 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400',
    is_available: true,
  },
  {
    id: '3',
    name_pt: 'Matapa',
    name_en: 'Matapa',
    description_pt: 'Prato tradicional moçambicano',
    description_en: 'Traditional Mozambican dish',
    category_id: '2',
    selling_price: 320,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400',
    is_available: true,
  },
  {
    id: '4',
    name_pt: 'Pudim de Coco',
    name_en: 'Coconut Pudding',
    description_pt: 'Pudim cremoso de coco',
    description_en: 'Creamy coconut pudding',
    category_id: '3',
    selling_price: 150,
    image_url: 'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=400',
    is_available: true,
  },
];

const MobileCustomer = () => {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<Record<string, number>>({});

  const filteredItems = mockMenuItems.filter(item => {
    const matchesCategory = selectedCategory === 'all' || item.category_id === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      item[`name_${language}` as keyof typeof item]?.toString().toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-card border-b shadow-soft">
        <div className="px-4 py-3 space-y-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t('common.welcome')}
            </Button>
            <LanguageToggle />
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t('common.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            <Button
              size="sm"
              variant={selectedCategory === 'all' ? 'default' : 'outline'}
              onClick={() => setSelectedCategory('all')}
              className="shrink-0"
            >
              {t('menu.all')}
            </Button>
            {mockCategories.map(cat => (
              <Button
                key={cat.id}
                size="sm"
                variant={selectedCategory === cat.id ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(cat.id)}
                className="shrink-0"
              >
                {cat[`name_${language}` as keyof typeof cat]}
              </Button>
            ))}
          </div>
        </div>
      </header>

      {/* Menu Items */}
      <main className="px-4 py-6 pb-32">
        <div className="space-y-4">
          {filteredItems.map(item => (
            <Card key={item.id} className="overflow-hidden hover:shadow-medium transition-shadow">
              <div className="flex gap-4 p-4">
                <img
                  src={item.image_url}
                  alt={item[`name_${language}` as keyof typeof item] as string}
                  className="w-24 h-24 object-cover rounded-lg shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg mb-1 truncate">
                    {item[`name_${language}` as keyof typeof item]}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {item[`description_${language}` as keyof typeof item]}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-primary">
                      {item.selling_price} MZN
                    </span>
                    {cart[item.id] ? (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCart(item.id, -1)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="font-semibold w-8 text-center">
                          {cart[item.id]}
                        </span>
                        <Button
                          size="sm"
                          variant="default"
                          className="h-8 w-8 p-0"
                          onClick={() => updateCart(item.id, 1)}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <Button
                        size="sm"
                        onClick={() => updateCart(item.id, 1)}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        {t('common.add')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </main>

      {/* Floating Cart Button */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent">
          <Button
            size="lg"
            className="w-full shadow-strong relative overflow-hidden group"
          >
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                <Badge variant="secondary" className="bg-primary-foreground text-primary">
                  {cartCount}
                </Badge>
              </div>
              <span>{t('menu.viewCart')}</span>
              <span className="font-bold">{cartTotal} MZN</span>
            </div>
          </Button>
        </div>
      )}
    </div>
  );
};

export default MobileCustomer;
