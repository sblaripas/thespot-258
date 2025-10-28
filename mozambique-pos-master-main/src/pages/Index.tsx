import { useNavigate } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Smartphone, 
  Tablet, 
  Monitor, 
  Users,
  ArrowRight 
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  const interfaces = [
    {
      id: 'mobile',
      icon: Smartphone,
      title: t('select.mobile'),
      description: t('select.mobile.desc'),
      path: '/mobile',
      gradient: 'from-primary to-primary-light',
    },
    {
      id: 'tablet',
      icon: Tablet,
      title: t('select.tablet'),
      description: t('select.tablet.desc'),
      path: '/tablet',
      gradient: 'from-secondary to-secondary-light',
    },
    {
      id: 'kiosk',
      icon: Monitor,
      title: t('select.kiosk'),
      description: t('select.kiosk.desc'),
      path: '/kiosk',
      gradient: 'from-accent to-emerald-500',
    },
    {
      id: 'staff',
      icon: Users,
      title: t('select.staff'),
      description: t('select.staff.desc'),
      path: '/staff',
      gradient: 'from-amber-500 to-orange-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-primary/5">
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-sunset bg-clip-text text-transparent">
              RestaurantOS
            </h1>
            <p className="text-sm text-muted-foreground">Mozambique Multi-Tenant POS</p>
          </div>
          <LanguageToggle />
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            {t('select.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            {t('select.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {interfaces.map((item, index) => (
            <Card
              key={item.id}
              className="relative overflow-hidden group cursor-pointer hover:shadow-strong transition-all duration-base animate-slide-up border-2 hover:border-primary/50"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => navigate(item.path)}
            >
              <div className="p-6 space-y-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-medium group-hover:scale-110 transition-transform duration-base`}>
                  <item.icon className="h-8 w-8 text-white" />
                </div>
                
                <div>
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-muted-foreground text-sm">
                    {item.description}
                  </p>
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all"
                >
                  {t('common.confirm')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-16 text-center text-sm text-muted-foreground">
          <p>Powered by RestaurantOS • Multi-Province Support</p>
          <p className="mt-1">Maputo • Gaza • Inhambane • Sofala • Manica • Tete • Zambézia • Nampula • Cabo Delgado • Niassa</p>
        </div>
      </main>
    </div>
  );
};

export default Index;
