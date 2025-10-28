"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { PageHeader } from "@/components/layout/page-header"
import { PageFooter } from "@/components/layout/page-footer"
import { PhoneInputForm } from "@/components/wallet/phone-input-form"
import { WalletBalanceCard } from "@/components/wallet/wallet-balance-card"
import { QRCodeCard } from "@/components/wallet/qr-code-card"
import { TransactionList } from "@/components/wallet/transaction-list"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getWalletByPhone, getWalletTransactions } from "./actions"

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

      const { data: walletData, error: walletError } = await getWalletByPhone(clientPhone)

      if (walletError) {
        setError(walletError)
        return
      }

      if (walletData) {
        setWallet(walletData)

        const { data: transactionData, error: transactionError } = await getWalletTransactions(walletData.id)

        if (transactionError) {
          console.error("Error fetching transactions:", transactionError)
        }

        setTransactions(transactionData || [])
      } else {
        setError(`No wallet found for phone number: ${clientPhone}`)
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
            <QRCodeCard walletId={wallet.id} phone={phone} />
            <TransactionList transactions={transactions} />
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
