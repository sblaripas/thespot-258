"use client"

import { useTenant } from "@/lib/context/tenant-context"
import { translations, type TranslationKey } from "@/lib/i18n/translations"

export function useTranslation() {
  const { language } = useTenant()

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key
  }

  return { t, language }
}
