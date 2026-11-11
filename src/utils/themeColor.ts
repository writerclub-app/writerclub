/** Surface colors by palette + theme — must match palettes.css */
const SURFACE_COLORS: Record<string, { light: string; dark: string }> = {
  modern:   { light: '#FFFFFF', dark: '#0F0F1A' },
  literary: { light: '#FAF7F0', dark: '#1A1510' },
  noir:     { light: '#FFFFFF', dark: '#0A0A0A' },
}

/**
 * Updates the <meta name="theme-color"> tag to match the current
 * theme (data-theme attribute) and palette (data-palette attribute).
 * Call this on startup and whenever the user changes theme or palette.
 */
export function syncThemeColor(): void {
  const t = document.documentElement.getAttribute('data-theme') ?? 'light'
  const p = document.documentElement.getAttribute('data-palette') ?? 'modern'
  const palette = SURFACE_COLORS[p] ?? SURFACE_COLORS['modern']
  const color = t === 'dark' ? palette.dark : palette.light
  const meta = document.getElementById('pwa-theme-color') as HTMLMetaElement | null
  if (meta) meta.content = color
}
