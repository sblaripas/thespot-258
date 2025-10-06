"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { ShoppingCart, Minus, Search, User, CheckCircle, XCircle, TableIcon } from "lucide-react"
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
  modifiers: string[]
  notes: string
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

interface Table {
  id: string
  table_number: number
  status: string
  assigned_waiter_id: string | null
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

const commonModifiers = [
  "No onions",
  "Extra cheese",
  "No ice",
  "Extra ice",
  "Less sugar",
  "Extra spicy",
  "No salt",
  "Well done",
  "Medium rare",
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
  const [tables, setTables] = useState<Table[]>([])
  const [selectedTable, setSelectedTable] = useState<Table | null>(null)
  const [showTableSelector, setShowTableSelector] = useState(false)
  const [showModifiersDialog, setShowModifiersDialog] = useState(false)
  const [currentModifierItem, setCurrentModifierItem] = useState<MenuItem | null>(null)
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([])
  const [itemNotes, setItemNotes] = useState("")
  const supabase = createClient()

  useEffect(() => {
    const storedUser = localStorage.getItem("staff_user")
    if (storedUser) {
      const user = JSON.parse(storedUser)
      if (user.role === "barman" || user.role === "waiter" || user.role === "admin") {
        setStaffUser(user)
        fetchMenuItems()
        if (user.role === "waiter" || user.role === "admin") {
          fetchTables()
        }
      } else {
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

  const fetchTables = async () => {
    try {
      const { data, error } = await supabase.from("tables").select("*").order("table_number")

      if (error) throw error
      setTables(data || [])
    } catch (error) {
      console.error("Error fetching tables:", error)
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
    setCurrentModifierItem(item)
    setSelectedModifiers([])
    setItemNotes("")
    setShowModifiersDialog(true)
  }

  const confirmAddToCart = () => {
    if (!currentModifierItem) return

    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.id === currentModifierItem.id &&
          JSON.stringify(cartItem.modifiers) === JSON.stringify(selectedModifiers) &&
          cartItem.notes === itemNotes,
      )

      if (existingItem) {
        return prevCart.map((cartItem) =>
          cartItem.id === existingItem.id &&
          JSON.stringify(cartItem.modifiers) === JSON.stringify(existingItem.modifiers) &&
          cartItem.notes === existingItem.notes
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem,
        )
      }

      return [...prevCart, { ...currentModifierItem, quantity: 1, modifiers: selectedModifiers, notes: itemNotes }]
    })

    setShowModifiersDialog(false)
    setCurrentModifierItem(null)
    setSelectedModifiers([])
    setItemNotes("")
  }

  const removeFromCart = (itemId: string, modifiers: string[], notes: string) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (cartItem) =>
          cartItem.id === itemId &&
          JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers) &&
          cartItem.notes === notes,
      )

      if (existingItem && existingItem.quantity > 1) {
        return prevCart.map((cartItem) =>
          cartItem.id === itemId &&
          JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers) &&
          cartItem.notes === notes
            ? { ...cartItem, quantity: cartItem.quantity - 1 }
            : cartItem,
        )
      }

      return prevCart.filter(
        (cartItem) =>
          !(
            cartItem.id === itemId &&
            JSON.stringify(cartItem.modifiers) === JSON.stringify(modifiers) &&
            cartItem.notes === notes
          ),
      )
    })
  }

  const getCartItemQuantity = (itemId: string, modifiers: string[], notes: string) => {
    const cartItem = cart.find(
      (item) =>
        item.id === itemId && JSON.stringify(item.modifiers) === JSON.stringify(modifiers) && item.notes === notes,
    )
    return cartItem ? cartItem.quantity : 0
  }

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0)
  }

  const createOrder = async () => {
    if (cart.length === 0 || !staffUser) return

    if (staffUser.role === "waiter" && !selectedTable) {
      alert("Please select a table first")
      return
    }

    if (clientWallet) {
      const totalAmount = getTotalPrice()
      if (clientWallet.balance < totalAmount) {
        alert("Insufficient wallet balance")
        return
      }
    }

    try {
      setProcessingOrder(true)
      setOrderStatus("pending")

      const orderData: any = {
        staff_id: staffUser.phone,
        total_amount: getTotalPrice(),
        status: clientWallet ? "pending_confirmation" : "confirmed",
        order_type: selectedTable ? "table" : "pos",
        client_confirmed: !clientWallet,
        notes: `${selectedTable ? `Table ${selectedTable.table_number}` : "POS"} - ${staffUser.name}`,
      }

      if (clientWallet) {
        orderData.wallet_id = clientWallet.id
      }

      if (selectedTable) {
        orderData.table_id = selectedTable.id
      }

      const { data: order, error: orderError } = await supabase.from("orders").insert(orderData).select().single()

      if (orderError) throw orderError

      const orderItems = cart.map((item) => ({
        order_id: order.id,
        menu_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity,
        modifiers: item.modifiers.length > 0 || item.notes ? { modifiers: item.modifiers, notes: item.notes } : null,
      }))

      const { error: itemsError } = await supabase.from("order_items").insert(orderItems)

      if (itemsError) throw itemsError

      if (selectedTable) {
        await supabase
          .from("tables")
          .update({
            status: "occupied",
            current_order_id: order.id,
            occupied_since: new Date().toISOString(),
          })
          .eq("id", selectedTable.id)
      }

      if (clientWallet) {
        setPendingOrderId(order.id)
        pollForConfirmation(order.id)
      } else {
        setOrderStatus("confirmed")
        setCart([])
        setSelectedTable(null)
        alert("Order created successfully!")
        setTimeout(() => setOrderStatus("idle"), 2000)
      }
    } catch (error) {
      console.error("Error creating order:", error)
      setOrderStatus("failed")
      alert("Failed to create order")
    } finally {
      setProcessingOrder(false)
    }
  }

  const pollForConfirmation = async (orderId: string) => {
    const maxAttempts = 60
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
          setTimeout(checkConfirmation, 5000)
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
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <h1 className="text-2xl md:text-3xl font-playfair font-bold text-primary">THE SPOT POS</h1>
              <p className="text-sm text-muted-foreground">
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
          <div className="lg:col-span-2 space-y-6">
            {staffUser?.role === "waiter" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="w-5 h-5" />
                    Table Selection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedTable ? (
                    <div className="flex items-center justify-between bg-muted p-3 rounded-lg">
                      <div>
                        <p className="font-semibold">Table {selectedTable.table_number}</p>
                        <p className="text-sm text-muted-foreground">Status: {selectedTable.status}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => setShowTableSelector(true)}>
                        Change Table
                      </Button>
                    </div>
                  ) : (
                    <Button onClick={() => setShowTableSelector(true)} className="w-full">
                      Select Table
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map((item) => {
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

                        <Button
                          size="sm"
                          onClick={() => addToCart(item)}
                          disabled={item.stock_quantity === 0}
                          className="w-full"
                        >
                          Add to Cart
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>

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
                      {cart.map((item, index) => (
                        <div
                          key={`${item.id}-${index}`}
                          className="flex justify-between items-start p-2 bg-muted rounded"
                        >
                          <div className="flex-1">
                            <p className="font-medium text-sm">{item.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.price} MT x {item.quantity}
                            </p>
                            {item.modifiers.length > 0 && (
                              <p className="text-xs text-blue-500 mt-1">{item.modifiers.join(", ")}</p>
                            )}
                            {item.notes && <p className="text-xs text-orange-500 mt-1">Note: {item.notes}</p>}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <p className="font-semibold">{item.price * item.quantity} MT</p>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFromCart(item.id, item.modifiers, item.notes)}
                              className="h-6 px-2"
                            >
                              <Minus className="w-3 h-3" />
                            </Button>
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

      <Dialog open={showTableSelector} onOpenChange={setShowTableSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Select Table</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
            {tables.map((table) => (
              <Button
                key={table.id}
                variant={selectedTable?.id === table.id ? "default" : "outline"}
                className={`h-20 flex flex-col ${table.status === "occupied" ? "opacity-50" : ""}`}
                onClick={() => {
                  setSelectedTable(table)
                  setShowTableSelector(false)
                }}
                disabled={table.status === "occupied" && table.id !== selectedTable?.id}
              >
                <span className="text-lg font-bold">Table {table.table_number}</span>
                <span className="text-xs">{table.status}</span>
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showModifiersDialog} onOpenChange={setShowModifiersDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Customize {currentModifierItem?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block">Modifiers</Label>
              <div className="space-y-2">
                {commonModifiers.map((modifier) => (
                  <div key={modifier} className="flex items-center space-x-2">
                    <Checkbox
                      id={modifier}
                      checked={selectedModifiers.includes(modifier)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedModifiers([...selectedModifiers, modifier])
                        } else {
                          setSelectedModifiers(selectedModifiers.filter((m) => m !== modifier))
                        }
                      }}
                    />
                    <Label htmlFor={modifier} className="cursor-pointer">
                      {modifier}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="notes" className="mb-2 block">
                Special Notes
              </Label>
              <Textarea
                id="notes"
                placeholder="Any special instructions..."
                value={itemNotes}
                onChange={(e) => setItemNotes(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowModifiersDialog(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={confirmAddToCart} className="flex-1">
                Add to Cart
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
