// Apenas letras e números, 3–15 caracteres
const USERNAME_RE = /^[a-z0-9]{3,15}$/

// Blocklist mínima PT + EN (expandir via backend futuramente)
const BLOCKED = new Set([
  'admin','root','system','suporte','support','moderator','moderacao',
  'puta','putaria','merda','cuzao','cuzão','fdp','viado','viadinho',
  'negro','negra','macaco','macaca','vagabundo','vagabunda',
  'fuck','shit','bitch','asshole','cunt','nigger','faggot','whore',
])

export function validateUsername(value: string): string | null {
  const v = value.toLowerCase().trim()
  if (v.length < 3)  return 'Mínimo 3 caracteres.'
  if (v.length > 15) return 'Máximo 15 caracteres.'
  if (!USERNAME_RE.test(v)) return 'Apenas letras minúsculas e números.'
  if (BLOCKED.has(v) || [...BLOCKED].some(b => v.includes(b))) {
    return 'Este username não está disponível.'
  }
  return null
}

export function normalizeUsername(raw: string): string {
  return raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9]/g, '')       // só letras e números
    .slice(0, 15)
}

/** Gera até 3 sugestões a partir do displayName */
export function suggestUsernames(displayName: string): string[] {
  const base = normalizeUsername(displayName)
  if (!base) return []

  const suggestions: string[] = []
  const short = base.slice(0, 12)

  // base pura
  if (short.length >= 3) suggestions.push(short)

  // base + sufixo aleatório de 2 dígitos
  const rnd = () => String(Math.floor(Math.random() * 90) + 10)
  if (short.length >= 3) suggestions.push(`${short.slice(0, 11)}${rnd()}`)

  // primeiros 6 chars + números
  const mini = base.slice(0, 6)
  if (mini.length >= 3) suggestions.push(`${mini}${rnd()}${rnd()}`)

  // deduplicar e filtrar inválidos
  return [...new Set(suggestions)].filter(s => !validateUsername(s))
}
