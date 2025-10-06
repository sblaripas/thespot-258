"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { PageHeader } from "@/components/layout/page-header"
import { CategoryFilter } from "@/components/menu/category-filter"
import { MenuItemCard } from "@/components/menu/menu-item-card"
import { CartSummary } from "@/components/menu/cart-summary"
import { CheckoutModal } from "@/components/menu/checkout-modal"
import { useCart } from "@/hooks/use-cart"
import { getMenuItems } from "./actions"
import { createTableOrder } from "@/lib/db/queries/orders"
import { useLanguage } from "@/lib/i18n/language-context"
import { useToast } from "@/hooks/use-toast"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  stock_quantity: number
}

const categories = [
  { id: "beers", name: "Cervejas", icon: "🍺" },
  { id: "ciders", name: "Cidras", icon: "🍻" },
  { id: "cocktails", name: "Coquetéis", icon: "🍹" },
  { id: "shots", name: "Shots", icon: "🥃" },
  { id: "liqueurs", name: "Licores", icon: "🍷" },
  { id: "bottles", name: "Garrafas", icon: "🍾" },
  { id: "food", name: "Comida", icon: "🍽️" },
]

export default function MenuPage() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const { toast } = useToast()
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState("beers")
  const [loading, setLoading] = useState(true)
  const [showCheckout, setShowCheckout] = useState(false)
  const { cart, addToCart, removeFromCart, getCartItemQuantity, clearCart } = useCart()

  useEffect(() => {
    fetchMenuItems()
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await getMenuItems()
      if (error) {
        console.error("Error fetching menu items:", error)
        return
      }
      setMenuItems(data)
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredItems = menuItems.filter((item) => item.category === activeCategory)

  const handleCheckoutConfirm = async (tableNumber: string, notes: string) => {
    const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const { data, error } = await createTableOrder({
      tableNumber: Number.parseInt(tableNumber),
      items: cart.map((item) => ({
        menuItemId: item.id,
        quantity: item.quantity,
        unitPrice: item.price,
      })),
      totalAmount,
      notes,
    })

    if (error) {
      toast({
        title: language === "en" ? "Error" : "Erro",
        description: error,
        variant: "destructive",
      })
      return
    }

    toast({
      title: language === "en" ? "Order Created" : "Pedido Criado",
      description:
        language === "en" ? "Your order has been sent to the kitchen" : "Seu pedido foi enviado para a cozinha",
    })

    clearCart()
    setShowCheckout(false)
    router.push(`/orders/track?orderId=${data.id}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <PageHeader subtitle={language === "en" ? "Digital Menu" : "Menu Digital"} />

      <main className="container mx-auto px-4 py-8">
        <CategoryFilter categories={categories} activeCategory={activeCategory} onCategoryChange={setActiveCategory} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => (
              <MenuItemCard
                key={item.id}
                item={item}
                quantity={getCartItemQuantity(item.id)}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item.id)}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">
                {language === "en" ? "No items available in this category" : "Nenhum item disponível nesta categoria"}
              </p>
            </div>
          )}
        </div>

        <CartSummary items={cart} onCheckout={() => setShowCheckout(true)} />

        {showCheckout && (
          <CheckoutModal
            items={cart}
            totalAmount={cart.reduce((sum, item) => sum + item.price * item.quantity, 0)}
            onClose={() => setShowCheckout(false)}
            onConfirm={handleCheckoutConfirm}
          />
        )}
      </main>
    </div>
  )
}
