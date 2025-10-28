"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import type { Tenant, TenantSettings, Language } from "@/lib/types/tenant"

interface TenantContextType {
  tenant: Tenant | null
  settings: TenantSettings | null
  language: Language
  setLanguage: (lang: Language) => void
  isLoading: boolean
  error: string | null
}

const TenantContext = createContext<TenantContextType | undefined>(undefined)

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

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(DEFAULT_TENANT)
  const [settings, setSettings] = useState<TenantSettings | null>(DEFAULT_SETTINGS)
  const [language, setLanguage] = useState<Language>("pt")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const savedLanguage = localStorage.getItem("preferred_language") as Language
    if (savedLanguage && (savedLanguage === "pt" || savedLanguage === "en")) {
      setLanguage(savedLanguage)
    }
  }, [])

  // Persist language preference
  useEffect(() => {
    if (language) {
      localStorage.setItem("preferred_language", language)
    }
  }, [language])

  return (
    <TenantContext.Provider
      value={{
        tenant,
        settings,
        language,
        setLanguage,
        isLoading,
        error,
      }}
    >
      {children}
    </TenantContext.Provider>
  )
}

export function useTenant() {
  const context = useContext(TenantContext)
  if (context === undefined) {
    throw new Error("useTenant must be used within a TenantProvider")
  }
  return context
}
