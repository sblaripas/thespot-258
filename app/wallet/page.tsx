"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { QrCode, Wallet, History, RefreshCw } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

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

export default function WalletPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [phone, setPhone] = useState("")
  const [showQR, setShowQR] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    // Check if phone is stored in localStorage
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

      // Fetch wallet data
      const { data: walletData, error: walletError } = await supabase
        .from("wallets")
        .select("*")
        .eq("client_phone", clientPhone)
        .single()

      if (walletError && walletError.code !== "PGRST116") {
        throw walletError
      }

      if (walletData) {
        setWallet(walletData)

        // Fetch transactions
        const { data: transactionData, error: transactionError } = await supabase
          .from("transactions")
          .select("*")
          .eq("wallet_id", walletData.id)
          .order("created_at", { ascending: false })
          .limit(10)

        if (transactionError) throw transactionError
        setTransactions(transactionData || [])
      }
    } catch (error) {
      console.error("Error fetching wallet data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.trim()) {
      localStorage.setItem("client_phone", phone)
      fetchWalletData(phone)
    }
  }

  const refreshWallet = () => {
    if (phone) {
      fetchWalletData(phone)
    }
  }

  const formatCurrency = (amount: number) => {
    return `${amount} MT`
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pt-MZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
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
      <div className="min-h-screen bg-gradient-to-b from-background to-card">
        <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
          <div className="container mx-auto px-4 py-4">
            <div className="flex flex-col items-center">
              <Image src="/the-spot-logo.png" alt="The Spot Logo" width={250} height={100} className="h-12 w-auto" />
              <p className="text-muted-foreground mt-1">Digital Payment System</p>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Access Your Wallet</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="84xxxxxxx"
                    className="w-full px-3 py-2 border border-border rounded-md bg-card text-foreground"
                    required
                  />
                </div>
                <Button type="submit" className="w-full">
                  Access Wallet
                </Button>
              </form>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-card">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur-sm border-b border-border header-glow">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col items-center">
            <Image src="/the-spot-logo.png" alt="The Spot Logo" width={250} height={100} className="h-12 w-auto" />
            <p className="text-muted-foreground mt-1">Digital Payment System</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {wallet ? (
          <div className="space-y-6">
            {/* Wallet Balance Card */}
            <Card className="bg-gradient-to-r from-primary/20 to-primary/10 border-primary/20">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Wallet className="w-6 h-6" />
                    My Wallet
                  </CardTitle>
                  <Button variant="outline" size="sm" onClick={refreshWallet}>
                    <RefreshCw className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{formatCurrency(wallet.balance)}</div>
                  <p className="text-muted-foreground">Available Balance</p>
                  <div className="mt-4 flex items-center justify-center gap-2">
                    <Badge variant={wallet.activated_at ? "default" : "secondary"}>
                      {wallet.activated_at ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* QR Code Card */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-6 h-6" />
                  My QR Code
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  {showQR ? (
                    <div className="space-y-4">
                      <div className="bg-white p-4 rounded-lg inline-block">
                        <QRCodeSVG
                          value={`${window.location.origin}/scan?wallet=${wallet.id}&phone=${phone}`}
                          size={200}
                          level="M"
                          includeMargin={true}
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">Show this QR code to staff for payments</p>
                      <Button variant="outline" onClick={() => setShowQR(false)}>
                        Hide QR Code
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">Generate your QR code for payments</p>
                      <Button onClick={() => setShowQR(true)}>Show QR Code</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Transaction History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <History className="w-6 h-6" />
                  Recent Transactions
                </CardTitle>
              </CardHeader>
              <CardContent>
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-muted-foreground">{formatDate(transaction.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-semibold ${
                              transaction.transaction_type === "credit" ? "text-green-500" : "text-red-500"
                            }`}
                          >
                            {transaction.transaction_type === "credit" ? "+" : "-"}
                            {formatCurrency(Math.abs(transaction.amount))}
                          </p>
                          <Badge variant={transaction.transaction_type === "credit" ? "default" : "secondary"}>
                            {transaction.transaction_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">No transactions yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="text-center">Wallet Not Found</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-muted-foreground mb-4">
                No wallet found for this phone number. Please scan a voucher QR code to activate your wallet.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  localStorage.removeItem("client_phone")
                  setPhone("")
                }}
              >
                Try Different Number
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
