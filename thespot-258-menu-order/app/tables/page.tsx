"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { TableLegend } from "@/components/tables/table-legend"
import { TableCard } from "@/components/tables/table-card"
import { getTablesStatus } from "./actions"

type TableStatus = {
  id: string
  table_number: number
  status: "free" | "occupied" | "reserved"
  assigned_waiter_id: string | null
  waiter_name: string | null
  current_order_id: string | null
  order_total: number | null
  occupied_since: string | null
  qr_code: string
}

export default function TablesPage() {
  const [tables, setTables] = useState<TableStatus[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadTables()
    const interval = setInterval(loadTables, 10000)
    return () => clearInterval(interval)
  }, [])

  async function loadTables() {
    try {
      const data = await getTablesStatus()
      setTables(data)
    } catch (error) {
      console.error("Error loading tables:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading tables...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-zinc-800 bg-black/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/staff">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <Link href="/" className="transition-transform hover:scale-110 duration-300 cursor-pointer">
              <Image src="/the-spot-logo.png" alt="The Spot" width={180} height={60} className="object-contain h-12" />
            </Link>
            <div className="w-10" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Table Management</h1>
          <p className="text-zinc-400">Monitor and manage all 12 tables</p>
        </div>

        <TableLegend />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {tables.map((table) => (
            <TableCard
              key={table.id}
              id={table.id}
              tableNumber={table.table_number}
              status={table.status}
              waiterName={table.waiter_name}
              orderTotal={table.order_total}
              occupiedSince={table.occupied_since}
            />
          ))}
        </div>
      </main>
    </div>
  )
}
