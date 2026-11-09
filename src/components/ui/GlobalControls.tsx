import { ThemeToggle } from './ThemeToggle'
import { LanguageSelector } from './LanguageSelector'
import { PaletteSelector } from './PaletteSelector'
import './GlobalControls.css'

export function GlobalControls() {
  return (
    <div className="global-controls">
      <PaletteSelector />
      <LanguageSelector />
      <ThemeToggle />
    </div>
  )
}
