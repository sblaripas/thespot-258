"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Minus, Plus, ShoppingCart } from "lucide-react"
import { getMenuItems } from "./actions"

interface MenuItem {
  id: string
  name: string
  description: string
  price: number
  category: string
  is_available: boolean
  stock_quantity: number
}

interface CartItem extends MenuItem {
  quantity: number
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
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState("beers")
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

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

  const addToCart = (item: MenuItem) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === item.id)
      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem,
        )
      }
      return [...prevCart, { ...item, quantity: 1 }]
    })
  }

  const removeFromCart = (itemId: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((cartItem) => cartItem.id === itemId)
      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId ? { ...cartItem, quantity: cartItem.quantity - 1 } : cartItem,
        )
      }
      return prevCart.filter((cartItem) => cartItem.id !== itemId)
    })
  }

  const getCartItemQuantity = (itemId: string) => {
    const cartItem = cart.find((item) => item.id === itemId)
    return cartItem ? cartItem.quantity : 0
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading menu...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center">
            <Image src="/the-spot-logo.png" alt="The Spot Logo" width={250} height={100} className="h-12 w-auto" />
            <p className="text-muted-foreground mt-1">Digital Menu</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Category Navigation */}
        <div className="flex overflow-x-auto pb-4 mb-8 gap-2 scrollbar-hide">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "secondary"}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                activeCategory === category.id ? "category-btn active" : "category-btn"
              }`}
              onClick={() => setActiveCategory(category.id)}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </Button>
          ))}
        </div>

        {/* Menu Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredItems.length > 0 ? (
            filteredItems.map((item) => {
              const quantity = getCartItemQuantity(item.id)
              return (
                <Card key={item.id} className="menu-item bg-card border-border">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{item.name}</h3>
                        {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="price-tag px-3 py-1 rounded-full text-sm font-bold text-primary-foreground">
                            {item.price} MT
                          </span>
                          {item.stock_quantity <= 5 && (
                            <Badge variant="destructive" className="text-xs">
                              Low Stock
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <div className="text-sm text-muted-foreground">Stock: {item.stock_quantity}</div>

                      {quantity > 0 ? (
                        <div className="flex items-center gap-2">
                          <Button size="sm" variant="outline" onClick={() => removeFromCart(item.id)}>
                            <Minus className="w-4 h-4" />
                          </Button>
                          <span className="font-semibold min-w-[2rem] text-center">{quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => addToCart(item)}
                            disabled={quantity >= item.stock_quantity}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" onClick={() => addToCart(item)} disabled={item.stock_quantity === 0}>
                          Add to Cart
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground text-lg">No items available in this category</p>
            </div>
          )}
        </div>

        {/* Cart Summary */}
        {cart.length > 0 && (
          <Card className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-80 bg-card border-border shadow-lg">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Cart ({getTotalItems()} items)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-4 max-h-32 overflow-y-auto">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-sm">
                    <span>
                      {item.name} x{item.quantity}
                    </span>
                    <span>{item.price * item.quantity} MT</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-border pt-2 mb-4">
                <div className="flex justify-between items-center font-semibold">
                  <span>Total:</span>
                  <span>{getTotalPrice()} MT</span>
                </div>
              </div>
              <Button className="w-full" size="lg">
                Proceed to Checkout
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
