import { useEffect, useMemo, useState } from 'react'

const CACHE_KEY = 'wc_avatar'

type CacheEntry = { url: string; data: string }

function readCache(): CacheEntry | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    return raw ? (JSON.parse(raw) as CacheEntry) : null
  } catch {
    return null
  }
}

function writeCache(entry: CacheEntry): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(entry))
  } catch {
    // quota exceeded — ignora silenciosamente
  }
}

async function fetchAsDataUrl(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`HTTP ${response.status}`)
  const blob = await response.blob()
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Retorna a URL do avatar pronta para usar no <Avatar>.
 * - Se há cache válido para a URL atual, usa o data URL cacheado (funciona offline).
 * - Se não há cache, busca a imagem, converte em data URL e salva.
 * - Se a busca falhar (429, offline…), retorna undefined → Avatar exibe fallback (iniciais).
 */
export function useAvatar(url?: string | null): string | undefined {
  const cached = useMemo(() => readCache(), [])

  const initialSrc = useMemo(() => {
    if (!url) return undefined
    if (cached?.url === url) return cached.data
    return undefined
  }, [url, cached])

  const [src, setSrc] = useState<string | undefined>(initialSrc)

  useEffect(() => {
    if (!url) return
    if (cached?.url === url) return // já temos cache válido

    fetchAsDataUrl(url)
      .then((dataUrl) => {
        writeCache({ url, data: dataUrl })
        setSrc(dataUrl)
      })
      .catch(() => {
        setSrc(undefined) // fallback → Avatar mostra iniciais
      })
  }, [url, cached])

  return src
}
