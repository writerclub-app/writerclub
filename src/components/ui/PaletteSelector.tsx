import { useThemeStore, type Palette } from '@/store/themeStore'
import { useTranslation } from 'react-i18next'
import './PaletteSelector.css'

const PALETTES: { id: Palette; label: string; swatch: string }[] = [
  { id: 'literary',  label: 'palette.literary', swatch: '#3B6E1A' },
  { id: 'minimal',   label: 'palette.minimal',  swatch: '#374151' },
  { id: 'modern',    label: 'palette.modern',   swatch: '#6366F1' },
]

export function PaletteSelector() {
  const { palette, setPalette } = useThemeStore()
  const { t } = useTranslation()

  return (
    <div className="palette-selector" role="group" aria-label={t('palette.label')}>
      {PALETTES.map(({ id, label, swatch }) => (
        <button
          key={id}
          className={`palette-swatch${palette === id ? ' palette-swatch--active' : ''}`}
          style={{ '--swatch-color': swatch } as React.CSSProperties}
          onClick={() => setPalette(id)}
          aria-label={t(label)}
          aria-pressed={palette === id}
          title={t(label)}
        />
      ))}
    </div>
  )
}
