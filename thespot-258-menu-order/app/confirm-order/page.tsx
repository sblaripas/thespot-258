"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { CheckCircle, XCircle, Clock, ShoppingCart } from "lucide-react"

interface Order {
  id: string
  total_amount: number
  status: string
  client_confirmed: boolean
  notes: string
  created_at: string
  wallet_id: string
}

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  total_price: number
  menu_item: {
    name: string
    description: string
  }
}

interface Wallet {
  id: string
  balance: number
  client_phone: string
}

function ConfirmOrderContent() {
  const [order, setOrder] = useState<Order | null>(null)
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [wallet, setWallet] = useState<Wallet | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const supabase = createClient()

  const orderId = searchParams.get("id")

  useEffect(() => {
    if (orderId) {
      fetchOrderDetails()
    } else {
      setError("Invalid order ID")
      setLoading(false)
    }
  }, [orderId])

  const fetchOrderDetails = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .single()

      if (orderError) throw orderError
      setOrder(orderData)

      // Fetch order items with menu item details
      const { data: itemsData, error: itemsError } = await supabase
        .from("order_items")
        .select(`
          *,
          menu_item:menu_items(name, description)
        `)
        .eq("order_id", orderId)

      if (itemsError) throw itemsError
      setOrderItems(itemsData || [])

      // Fetch wallet
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("id", orderData.wallet_id)
        .single()

      if (walletError) throw walletError
      setWallet(walletData)
    } catch (error) {
      console.error("Error fetching order details:", error)
      setError("Failed to load order details")
    } finally {
      setLoading(false)
    }
  }

  const confirmOrder = async () => {
    if (!order || !wallet) return

    if (wallet.balance < order.total_amount) {
      setError("Insufficient wallet balance")
      return
    }

    try {
      setConfirming(true)
      setError(null)

      // Update order status
      const { error: orderError } = await supabase
        .from("orders")
        .update({
          client_confirmed: true,
          status: "confirmed",
        })
        .eq("id", order.id)

      if (orderError) throw orderError

      // Update wallet balance
      const { error: walletError } = await supabase
        .from("wallets")
        .update({
          balance: wallet.balance - order.total_amount,
        })
        .eq("id", wallet.id)

      if (walletError) throw walletError

      // Create transaction record
      const { error: transactionError } = await supabase.from("transactions").insert({
        wallet_id: wallet.id,
        order_id: order.id,
        amount: -order.total_amount,
        transaction_type: "debit",
        description: `Order payment - ${order.total_amount} MT`,
      })

      if (transactionError) throw transactionError

      // Update stock quantities
      for (const item of orderItems) {
        const { error: stockError } = await supabase
          .from("menu_items")
          .update({
            stock_quantity: supabase.raw("stock_quantity - ?", [item.quantity]),
          })
          .eq("id", item.menu_item_id)

        if (stockError) {
          console.error("Error updating stock:", stockError)
        }
      }

      // Redirect to success page or wallet
      setTimeout(() => {
        router.push("/wallet")
      }, 3000)
    } catch (error) {
      console.error("Error confirming order:", error)
      setError("Failed to confirm order")
    } finally {
      setConfirming(false)
    }
  }

  const rejectOrder = async () => {
    if (!order) return

    try {
      const { error } = await supabase
        .from("orders")
        .update({
          status: "cancelled",
          client_confirmed: false,
        })
        .eq("id", order.id)

      if (error) throw error

      router.push("/wallet")
    } catch (error) {
      console.error("Error rejecting order:", error)
      setError("Failed to reject order")
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading order...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center">
            <h1 className="text-3xl md:text-4xl font-playfair font-bold text-center text-primary">THE SPOT</h1>
            <p className="text-muted-foreground mt-1">Order Confirmation</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 justify-center">
              <ShoppingCart className="w-6 h-6" />
              Confirm Your Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="text-center space-y-4">
                <XCircle className="w-16 h-16 text-destructive mx-auto" />
                <div>
                  <h3 className="text-lg font-semibold text-destructive">Error</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <Button variant="outline" onClick={() => router.push("/wallet")}>
                  Go to Wallet
                </Button>
              </div>
            ) : order && wallet ? (
              <div className="space-y-6">
                {/* Order Status */}
                <div className="text-center">
                  <Badge variant={order.client_confirmed ? "default" : "secondary"} className="mb-2">
                    {order.client_confirmed ? "Confirmed" : "Pending Confirmation"}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Order placed: {new Date(order.created_at).toLocaleString()}
                  </p>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h3 className="font-semibold">Order Items:</h3>
                  {orderItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 bg-muted rounded">
                      <div>
                        <p className="font-medium">{item.menu_item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.unit_price} MT x {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold">{item.total_price} MT</p>
                    </div>
                  ))}
                </div>

                {/* Total and Wallet Info */}
                <div className="space-y-3 border-t pt-4">
                  <div className="flex justify-between items-center font-bold text-lg">
                    <span>Total:</span>
                    <span>{order.total_amount} MT</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>Wallet Balance:</span>
                    <span className={wallet.balance >= order.total_amount ? "text-green-500" : "text-red-500"}>
                      {wallet.balance} MT
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span>After Payment:</span>
                    <span>{wallet.balance - order.total_amount} MT</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {!order.client_confirmed ? (
                  <div className="space-y-2">
                    <Button
                      className="w-full"
                      onClick={confirmOrder}
                      disabled={confirming || wallet.balance < order.total_amount}
                    >
                      {confirming ? (
                        <>
                          <Clock className="w-4 h-4 mr-2 animate-spin" />
                          Confirming...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Order
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="w-full bg-transparent" onClick={rejectOrder}>
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject Order
                    </Button>
                  </div>
                ) : (
                  <div className="text-center space-y-4">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto" />
                    <div>
                      <h3 className="text-lg font-semibold text-green-500">Order Confirmed!</h3>
                      <p className="text-muted-foreground">Your order has been confirmed and payment processed.</p>
                      <p className="text-sm text-muted-foreground mt-2">Redirecting to wallet...</p>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function ConfirmOrderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading...</p>
          </div>
        </div>
      }
    >
      <ConfirmOrderContent />
    </Suspense>
  )
}
