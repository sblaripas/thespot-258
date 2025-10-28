// Tenant and Multi-tenancy Types
export interface Tenant {
  id: string
  name: string
  legal_name: string | null
  domain: string
  province: MozambiqueProvince
  city: string
  address: string | null
  phone: string | null
  email: string | null
  timezone: string
  base_language: Language
  currency: string
  is_active: boolean
  subscription_tier: SubscriptionTier
  created_at: string
  updated_at: string
}

export type MozambiqueProvince =
  | "Maputo"
  | "Gaza"
  | "Inhambane"
  | "Sofala"
  | "Manica"
  | "Tete"
  | "Zambézia"
  | "Nampula"
  | "Cabo Delgado"
  | "Niassa"

export type Language = "pt" | "en"

export type SubscriptionTier = "basic" | "pro" | "enterprise"

export interface TenantSettings {
  tenant_id: string
  languages: Language[]
  default_language: Language
  date_format: string
  time_format: "12h" | "24h"
  opening_time: string
  closing_time: string
  tax_enabled: boolean
  tax_rate: number
  tax_name: string
  receipt_header_pt: string | null
  receipt_header_en: string | null
  receipt_footer_pt: string | null
  receipt_footer_en: string | null
  receipt_show_tax: boolean
  auto_table_status: boolean
  table_timeout_minutes: number
  created_at: string
  updated_at: string
}

export interface BilingualText {
  pt: string
  en: string
}
