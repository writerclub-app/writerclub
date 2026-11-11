import { create } from 'zustand'
import type { Theme } from '@/hooks/useTheme'
import { syncThemeColor } from '@/utils/themeColor'

export type Palette = 'literary' | 'minimal' | 'modern'

function getInitialTheme(): Theme {
  const saved = localStorage.getItem('theme') as Theme | null
  if (saved) return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function getInitialPalette(): Palette {
  return (localStorage.getItem('palette') as Palette | null) ?? 'modern'
}

interface ThemeStore {
  theme: Theme
  palette: Palette
  toggle: () => void
  setPalette: (palette: Palette) => void
}

export const useThemeStore = create<ThemeStore>((set, get) => ({
  theme: getInitialTheme(),
  palette: getInitialPalette(),
  toggle: () => {
    const next: Theme = get().theme === 'light' ? 'dark' : 'light'
    document.documentElement.setAttribute('data-theme', next)
    localStorage.setItem('theme', next)
    set({ theme: next })
    syncThemeColor()
  },
  setPalette: (palette: Palette) => {
    document.documentElement.setAttribute('data-palette', palette)
    localStorage.setItem('palette', palette)
    set({ palette })
    syncThemeColor()
  },
}))
