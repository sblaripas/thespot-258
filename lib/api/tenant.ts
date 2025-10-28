"use server"

import { createServiceClient } from "@/lib/supabase/server"
import type { Tenant, TenantSettings } from "@/lib/types/tenant"

const DEFAULT_TENANT: Tenant = {
  id: "00000000-0000-0000-0000-000000000001",
  name: "The Spot",
  slug: "the-spot",
  timezone: "Africa/Maputo",
  currency: "MZN",
  tax_rate: 16,
  is_active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const DEFAULT_SETTINGS: TenantSettings = {
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
}

export async function getTenantById(tenantId: string) {
  try {
    const supabase = await createServiceClient()

    let tenantResult
    let settingsResult

    try {
      tenantResult = await supabase.from("tenants").select("*").eq("id", tenantId).single()
    } catch (fetchError: any) {
      console.warn("[v0] Tenants table not found. Using default tenant. Run migration: 007_migrate_to_multitenant.sql")
      return {
        tenant: DEFAULT_TENANT,
        settings: DEFAULT_SETTINGS,
      }
    }

    if (tenantResult.error) {
      if (
        tenantResult.error.code === "PGRST205" ||
        tenantResult.error.code === "PGRST116" ||
        tenantResult.error.message.includes("Could not find the table")
      ) {
        console.warn(
          "[v0] Tenants table not found. Using default tenant. Run migration: 007_migrate_to_multitenant.sql",
        )
        return {
          tenant: DEFAULT_TENANT,
          settings: DEFAULT_SETTINGS,
        }
      }
      console.warn("[v0] Error fetching tenant, using defaults:", tenantResult.error.message)
      return {
        tenant: DEFAULT_TENANT,
        settings: DEFAULT_SETTINGS,
      }
    }

    try {
      settingsResult = await supabase.from("tenant_settings").select("*").eq("tenant_id", tenantId).single()
    } catch (fetchError: any) {
      console.warn("[v0] Tenant settings table not found, using defaults")
      return {
        tenant: tenantResult.data as Tenant,
        settings: DEFAULT_SETTINGS,
      }
    }

    if (settingsResult.error) {
      console.warn("[v0] Tenant settings not found, using defaults")
      return {
        tenant: tenantResult.data as Tenant,
        settings: DEFAULT_SETTINGS,
      }
    }

    return {
      tenant: tenantResult.data as Tenant,
      settings: settingsResult.data as TenantSettings,
    }
  } catch (error: any) {
    console.warn("[v0] Error loading tenant, using defaults:", error?.message || error)
    return {
      tenant: DEFAULT_TENANT,
      settings: DEFAULT_SETTINGS,
    }
  }
}

export async function getTenantByDomain(domain: string) {
  try {
    const supabase = await createServiceClient()

    let tenantQuery
    try {
      tenantQuery = await supabase.from("tenants").select("*").eq("domain", domain).eq("is_active", true).single()
    } catch (fetchError: any) {
      console.warn("[v0] Tenants table not found. Using default tenant.")
      return {
        tenant: DEFAULT_TENANT,
        settings: DEFAULT_SETTINGS,
      }
    }

    if (tenantQuery.error) {
      if (
        tenantQuery.error.code === "PGRST205" ||
        tenantQuery.error.code === "PGRST116" ||
        tenantQuery.error.message.includes("Could not find the table")
      ) {
        console.warn("[v0] Tenants table not found. Using default tenant.")
        return {
          tenant: DEFAULT_TENANT,
          settings: DEFAULT_SETTINGS,
        }
      }
      console.warn("[v0] Error fetching tenant by domain, using defaults:", tenantQuery.error.message)
      return {
        tenant: DEFAULT_TENANT,
        settings: DEFAULT_SETTINGS,
      }
    }

    let settingsQuery
    try {
      settingsQuery = await supabase.from("tenant_settings").select("*").eq("tenant_id", tenantQuery.data.id).single()
    } catch (fetchError: any) {
      console.warn("[v0] Tenant settings not found, using defaults")
      return {
        tenant: tenantQuery.data as Tenant,
        settings: DEFAULT_SETTINGS,
      }
    }

    if (settingsQuery.error) {
      console.warn("[v0] Tenant settings not found, using defaults")
      return {
        tenant: tenantQuery.data as Tenant,
        settings: DEFAULT_SETTINGS,
      }
    }

    return {
      tenant: tenantQuery.data as Tenant,
      settings: settingsQuery.data as TenantSettings,
    }
  } catch (error: any) {
    console.warn("[v0] Error loading tenant by domain, using defaults:", error?.message || error)
    return {
      tenant: DEFAULT_TENANT,
      settings: DEFAULT_SETTINGS,
    }
  }
}
