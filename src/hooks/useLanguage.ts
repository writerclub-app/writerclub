import { useState } from 'react'
import { useTranslation } from 'react-i18next'

export type Language = 'pt' | 'en' | 'es' | 'it'

export const LANGUAGES: { value: Language; label: string }[] = [
  { value: 'pt', label: 'Português' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Español' },
  { value: 'it', label: 'Italiano' },
]

export function useLanguage() {
  const { i18n } = useTranslation()
  const [language, setLanguage] = useState<Language>((i18n.language as Language) ?? 'pt')

  const change = (lang: Language) => {
    void i18n.changeLanguage(lang)
    localStorage.setItem('lang', lang)
    setLanguage(lang)
  }

  return { language, change }
}
