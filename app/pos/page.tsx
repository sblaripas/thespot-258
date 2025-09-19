"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, Minus, Plus, Search, User, CheckCircle, XCircle } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

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

interface Wallet {
  id: string
  balance: number
  client_phone: string
  activated_at: string | null
}

interface StaffUser {
  phone: string
  name: string
  role: string
  otp: string
}

const categories = [
  { id: "beers", name: "Cervejas" },
  { id: "ciders", name: "Cidras" },
  { id: "cocktails", name: "Coquetéis" },
  { id: "shots", name: "Shots" },
  { id: "liqueurs", name: "Licores" },
  { id: "bottles", name: "Garrafas" },
  { id: "food", name: "Comida" },
]

export default function POSPage() {
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null)
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [activeCategory, setActiveCategory] = useState("beers")
  const [cart, setCart] = useState<CartItem[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [clientPhone, setClientPhone] = useState("")
  const [clientWallet, setClientWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [processingOrder, setProcessingOrder] = useState(false)
  const [orderStatus, setOrderStatus] = useState<"idle" | "pending" | "confirmed" | "failed">("idle")
  const [pendingOrderId, setPendingOrderId] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    // Check if staff user is logged in
    const storedUser = localStorage.getItem("staff_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "barman" || user.role === "waiter" || user.role === "admin") {
        setStaffUser(user)
        fetchMenuItems()
      } else {
        // Redirect non-authorized users
        window.location.href = "/staff"
      }
    } else {
      window.location.href = "/staff"
    }
  }, [])

  const fetchMenuItems = async () => {
    try {
      const { data, error } = await supabase.from("menu_items").select("*").eq("is_available", true).order("name")

      if (error) throw error
      setMenuItems(data || [])
    } catch (error) {
      console.error("Error fetching menu items:", error)
    } finally {
      setLoading(false)
    }
  }

  const searchClient = async () => {
    if (!clientPhone.trim()) return

    try {
      const { data, error } = await supabase.from("wallets").select("*").eq("client_phone", clientPhone).single()

      if (error) {
        if (error.code === "PGRST116") {
          alert("Client wallet not found. Please ask client to scan their voucher first.")
        } else {
          throw error
        }
        return
      }

      setClientWallet(data)
    } catch (error) {
      console.error("Error searching client:", error)
      alert("Error searching for client")
    }
  }

  const filteredItems = menuItems.filter((item) => {
    const matchesCategory = item.category === activeCategory
    const matchesSearch =
      searchTerm === "" ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesCategory && matchesSearch
  })

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

  const createOrder = async () => {
    if (!clientWallet || cart.length === 0 || !staffUser) return

    const totalAmount = getTotalPrice()

    if (clientWallet.balance < totalAmount) {
      alert("Insufficient wallet balance")
      return
    }

    try {
      setProcessingOrder(true)
      setOrderStatus("pending")

      // Create order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          wallet_id: clientWallet.id,
          staff_id: staffUser.phone,
          total_amount: totalAmount,
          status: "pending_confirmation",
          order_type: "pos",
          client_confirmed: false,
          notes: `POS Order by ${staffUser.name}`,
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items
      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      setPendingOrderId(order.id)

      // Poll for client confirmation
      pollForConfirmation(order.id)
    } catch (error) {
      console.error("Error creating order:", error)
      setOrderStatus("failed")
      alert("Failed to create order")
    } finally {
      setProcessingOrder(false)
    }
  }

  const pollForConfirmation = async (orderId: string) => {
    const maxAttempts = 60 // 5 minutes
    let attempts = 0

    const checkConfirmation = async () => {
      try {
        const { data, error } = await supabase
          .from("orders")
          .select("client_confirmed, status")
          .eq("id", orderId)
          .single()

        if (error) throw error

        if (data.client_confirmed) {
          setOrderStatus("confirmed")
          setCart([])
          setClientWallet(null)
          setClientPhone("")
          setPendingOrderId(null)
          alert("Order confirmed by client!")
          return
        }

        attempts++
        if (attempts < maxAttempts) {
          setTimeout(checkConfirmation, 5000) // Check every 5 seconds
        } else {
          setOrderStatus("failed")
          alert("Order confirmation timeout. Please try again.")
        }
      } catch (error) {
        console.error("Error checking confirmation:", error)
        setOrderStatus("failed")
      }
    }

    checkConfirmation()
  }

  const clearCart = () => {
    setCart([])
    setOrderStatus("idle")
    setPendingOrderId(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading POS...</p>
        </div>
      </div>
    )
  }

  if (!staffUser) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary">THE SPOT POS</h1>
              <p className="text-muted-foreground">
                Staff: {staffUser.name} ({staffUser.role})
              </p>
            </div>
            <Button variant="outline" onClick={() => (window.location.href = "/staff")}>
              Back to Staff Portal
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Menu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Client Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 mb-4">
                  <Input
                    placeholder="Enter client phone number"
                    value={clientPhone}
                    onChange={(e) => setClientPhone(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={searchClient}>
                    <Search className="w-4 h-4" />
                  </Button>
                </div>

                {clientWallet && (
                  <div className="bg-muted p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{clientWallet.client_phone}</p>
                        <p className="text-sm text-muted-foreground">
                          Status: {clientWallet.activated_at ? "Active" : "Inactive"}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{clientWallet.balance} MT</p>
                        <p className="text-sm text-muted-foreground">Balance</p>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Search and Categories */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <Input
                    placeholder="Search menu items..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                  />

                  <div className="flex overflow-x-auto pb-2 gap-2">
                    {categories.map((category) => (
                      <Button
                        key={category.id}
                        variant={activeCategory === category.id ? "default" : "secondary"}
                        className="whitespace-nowrap"
                        onClick={() => setActiveCategory(category.id)}
                      >
                        {category.name}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Menu Items */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
                const quantity = getCartItemQuantity(item.id)
                return (
                  <Card key={item.id} className="menu-item">
                    <CardContent className="p-4">
                      <div className="space-y-3">
                        <div>
                          <h3 className="font-semibold">{item.name}</h3>
                          {item.description && <p className="text-sm text-muted-foreground">{item.description}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="price-tag px-2 py-1 rounded text-sm font-bold">{item.price} MT</span>
                            <Badge variant={item.stock_quantity > 10 ? "default" : "destructive"}>
                              Stock: {item.stock_quantity}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
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
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

          {/* Right Column - Cart */}
          <div className="space-y-6">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Order Cart ({getTotalItems()} items)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {cart.length > 0 ? (
                  <div className="space-y-4">
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {cart.map((item) => (
                        <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.price} MT x {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{item.price * item.quantity} MT</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center font-bold text-lg">
                        <span>Total:</span>
                        <span>{getTotalPrice()} MT</span>
                      </div>
                    </div>

                    {orderStatus === "pending" && (
                      <div className="text-center space-y-2">
                        <div className="flex items-center justify-center gap-2 text-yellow-500">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-500"></div>
                          <span>Waiting for client confirmation...</span>
                        </div>
                        {pendingOrderId && (
                          <div className="bg-white p-2 rounded">
                            <QRCodeSVG
                              value={`${window.location.origin}/confirm-order?id=${pendingOrderId}`}
                              size={120}
                              level="M"
                            />
                            <p className="text-xs text-muted-foreground mt-1">Show to client to confirm</p>
                          </div>
                        )}
                      </div>
                    )}

                    {orderStatus === "confirmed" && (
                      <div className="text-center text-green-500">
                        <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>Order Confirmed!</p>
                      </div>
                    )}

                    {orderStatus === "failed" && (
                      <div className="text-center text-red-500">
                        <XCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>Order Failed</p>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Button
                        className="w-full"
                        onClick={createOrder}
                        disabled={!clientWallet || processingOrder || orderStatus === "pending"}
                      >
                        {processingOrder ? "Processing..." : "Send Order to Client"}
                      </Button>
                      <Button variant="outline" className="w-full bg-transparent" onClick={clearCart}>
                        Clear Cart
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">Cart is empty</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
