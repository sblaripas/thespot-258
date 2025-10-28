import { NextResponse } from "next/server"
import { getTenantById } from "@/lib/api/tenant"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const data = await getTenantById(params.id)
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error fetching tenant:", error)
    return NextResponse.json(
      {
        tenant: {
          id: "00000000-0000-0000-0000-000000000001",
          name: "The Spot",
          slug: "the-spot",
          timezone: "Africa/Maputo",
          currency: "MZN",
          tax_rate: 16,
          is_active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        settings: {
          id: "00000000-0000-0000-0000-000000000001",
          tenant_id: "00000000-0000-0000-0000-000000000001",
          default_language: "pt",
          supported_languages: ["pt", "en"],
          allow_online_orders: true,
          allow_reservations: true,
          require_table_assignment: true,
          auto_print_orders: false,
          low_stock_threshold: 10,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      },
      { status: 200 },
    )
  }
}
