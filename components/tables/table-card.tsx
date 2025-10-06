import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Clock, DollarSign } from "lucide-react"

interface TableCardProps {
  id: string
  tableNumber: number
  status: "free" | "occupied" | "reserved"
  waiterName: string | null
  orderTotal: number | null
  occupiedSince: string | null
}

export function TableCard({ id, tableNumber, status, waiterName, orderTotal, occupiedSince }: TableCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "free":
        return "bg-green-500"
      case "occupied":
        return "bg-red-500"
      case "reserved":
        return "bg-yellow-500"
      default:
        return "bg-gray-500"
    }
  }

  const getOccupiedDuration = (occupiedSince: string | null) => {
    if (!occupiedSince) return null
    const minutes = Math.floor((Date.now() - new Date(occupiedSince).getTime()) / 60000)
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const duration = getOccupiedDuration(occupiedSince)
  const isLongOccupied = duration && Number.parseInt(duration) > 120

  return (
    <Link href={`/tables/${id}`}>
      <Card
        className={`p-4 bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer ${
          isLongOccupied ? "ring-2 ring-orange-500" : ""
        }`}
      >
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-xl font-bold">Table {tableNumber}</h3>
            <Badge variant="secondary" className={`${getStatusColor(status)} text-white mt-1`}>
              {status}
            </Badge>
          </div>
          <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
        </div>

        {status === "occupied" && (
          <div className="space-y-2 text-sm">
            {waiterName && (
              <div className="flex items-center gap-2 text-zinc-400">
                <Users className="h-4 w-4" />
                <span>{waiterName}</span>
              </div>
            )}
            {duration && (
              <div className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
            {orderTotal && (
              <div className="flex items-center gap-2 text-zinc-400">
                <DollarSign className="h-4 w-4" />
                <span>{orderTotal} MZN</span>
              </div>
            )}
          </div>
        )}

        {status === "free" && <p className="text-sm text-zinc-500">Available for seating</p>}
      </Card>
    </Link>
  )
}
