"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { PhoneInputForm } from "@/components/wallet/phone-input-form"
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card"
import { QRCodeCard } from "@/components/wallet/qr-code-card"
import { TransactionList } from "@/components/wallet/transaction-list"
import { OrdersSection } from "@/components/wallet/orders-section"
import { PaymentsSection } from "@/components/wallet/payments-section"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface WalletData {
  id: string
  balance: number
  client_phone: string
  activated_at: string | null
  created_at: string
}

interface Transaction {
  id: string
  amount: number
  transaction_type: string
  description: string
  created_at: string
  order_id: string | null
}

interface OrderItem {
  id: string
  menu_item_id: string
  quantity: number
  unit_price: number
  total_price: number
  menu_item?: {
    name: string
    category: string
  }
}

interface Order {
  id: string
  status: string
  order_type: string
  total_amount: number
  client_confirmed: boolean
  created_at: string
  order_items: OrderItem[]
}

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [todaysOrders, setTodaysOrders] = useState<Order[]>([])
  const [pendingOrders, setPendingOrders] = useState<Order[]>([])
  const [canceledOrders, setCanceledOrders] = useState<Order[]>([])
  const [todaysPayments, setTodaysPayments] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const storedPhone = localStorage.getItem("client_phone")
    if (storedPhone) {
      setPhone(storedPhone)
      fetchWalletData(storedPhone)
    } else {
      setLoading(false)
    }
  }, [])

  const fetchWalletData = async (clientPhone: string) => {
    try {
      setLoading(true)
      setError(null)
      const cleanPhone = clientPhone.replace(/\D/g, "")

      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("client_phone", cleanPhone)
        .single()

      if (walletError && walletError.code !== "PGRST116") {
        throw walletError
      }

      if (walletData) {
        setWallet(walletData)

        const { data: transactionData, error: transactionError } = await supabase
          .from("transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (transactionError) throw transactionError
        setTransactions(transactionData || [])

        const startOfDay = new Date()
        startOfDay.setHours(0, 0, 0, 0)

        const { data: paymentsData, error: paymentsError } = await supabase
          .from("transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .gte("created_at", startOfDay.toISOString())
          .order("created_at", { ascending: false })

        if (paymentsError) throw paymentsError
        setTodaysPayments(paymentsData || [])

        const { data: ordersData, error: ordersError } = await supabase
          .from("orders")
          .select(`
            *,
            order_items (
              *,
              menu_item:menu_items (
                name,
                category
              )
            )
          `)
          .eq("wallet_id", walletData.id)
          .gte("created_at", startOfDay.toISOString())
          .order("created_at", { ascending: false })

        if (ordersError) throw ordersError

        const orders = ordersData || []
        setTodaysOrders(orders)

        setPendingOrders(orders.filter((order: Order) => order.status === "pending"))
        setCanceledOrders(orders.filter((order: Order) => order.status === "canceled"))
      } else {
        setError(`No wallet found for phone number: ${cleanPhone}`)
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error)
      setError("An error occurred while fetching wallet data")
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = (submittedPhone: string) => {
    localStorage.setItem("client_phone", submittedPhone)
    setPhone(submittedPhone)
    fetchWalletData(submittedPhone)
  }

  const handleLogout = () => {
    localStorage.removeItem("client_phone")
    setPhone("")
    setWallet(null)
    setTransactions([])
    setTodaysOrders([])
    setPendingOrders([])
    setCanceledOrders([])
    setTodaysPayments([])
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    )
  }

  if (!phone) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-card flex flex-col">
        <PageHeader subtitle="Digital Payment System" showLanguageSwitcher={false} />
        <main className="container mx-auto px-4 py-8 flex-1">
          <PhoneInputForm onSubmit={handlePhoneSubmit} />
        </main>
        <PageFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card flex flex-col">
      <PageHeader subtitle="Digital Payment System" showLanguageSwitcher={false} />

      <main className="container mx-auto px-4 py-8 flex-1">
        {wallet ? (
          <div className="space-y-6">
            <WalletBalanceCard
              balance={wallet.balance}
              phone={phone}
              isActivated={!!wallet.activated_at}
              onRefresh={() => fetchWalletData(phone)}
            />

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 mt-6">
                <div className="grid gap-4 md:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{todaysOrders.length}</div>
                      <p className="text-xs text-muted-foreground">Total orders today</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Pending</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-amber-500">{pendingOrders.length}</div>
                      <p className="text-xs text-muted-foreground">Awaiting confirmation</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">Canceled</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-500">{canceledOrders.length}</div>
                      <p className="text-xs text-muted-foreground">Canceled today</p>
                    </CardContent>
                  </Card>
                </div>

                {pendingOrders.length > 0 && (
                  <OrdersSection orders={pendingOrders} title="Pending Orders" emptyMessage="No pending orders" />
                )}

                <QRCodeCard walletId={wallet.id} phone={phone} />
              </TabsContent>

              <TabsContent value="orders" className="space-y-6 mt-6">
                <OrdersSection orders={todaysOrders} title="All Today's Orders" emptyMessage="No orders today" />

                {canceledOrders.length > 0 && (
                  <OrdersSection orders={canceledOrders} title="Canceled Orders" emptyMessage="No canceled orders" />
                )}
              </TabsContent>

              <TabsContent value="payments" className="space-y-6 mt-6">
                <PaymentsSection payments={todaysPayments} />
              </TabsContent>

              <TabsContent value="history" className="space-y-6 mt-6">
                <TransactionList transactions={transactions} />
              </TabsContent>
            </Tabs>

            <div className="text-center">
              <Button variant="outline" onClick={handleLogout}>
                Use Different Number
              </Button>
            </div>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Wallet Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">{error}</div>}
              <p className="text-muted-foreground">
                No wallet found for this phone number. Please scan a voucher QR code to activate your wallet.
              </p>
              <Button variant="outline" onClick={handleLogout}>
                Try Different Number
              </Button>
            </CardContent>
          </Card>
        )}
      </main>

      <PageFooter />
    </div>
  )
}
