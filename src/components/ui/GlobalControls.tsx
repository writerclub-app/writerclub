import { useEffect } from 'react'
import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { PaletteSelector } from './PaletteSelector'
import './GlobalControls.css'

/** Garante que data-theme e data-palette sejam aplicados ao DOM
 *  mesmo em contextos onde main.tsx não foi suficiente
 *  (ex: deep link direto numa aba nova com SW em cache). */
function useApplyStoredTheme() {
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute(
        'data-theme',
        savedTheme ?? (prefersDark ? 'dark' : 'light')
      )
      const savedPalette = localStorage.getItem('palette') ?? 'modern'
      document.documentElement.setAttribute('data-palette', savedPalette)
    } catch { /* ignore in private/restricted contexts */ }
  }, [])
}

export function GlobalControls() {
  useApplyStoredTheme()

  return (
    <div className="global-controls">
      <PaletteSelector />
      <LanguageSelector />
      <ThemeToggle />
    </div>
  )
}
