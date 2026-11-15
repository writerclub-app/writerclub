const API_URL = import.meta.env.VITE_API_URL as string

export type ContentWarningTag =
  // Avisos de conteúdo sensível (disparam gate)
  | 'erotic' | 'violence' | 'suicide' | 'drugs' | 'trauma' | 'abuse'
  // Temas descritivos (sem gate)
  | 'love' | 'relationships' | 'nature' | 'religion' | 'politics'
  | 'humor' | 'family' | 'loss' | 'identity' | 'fantasy' | 'mystery' | 'social' | 'spirituality'

export const WARNING_GATE_TAGS: ContentWarningTag[] = ['erotic', 'violence', 'suicide', 'drugs', 'trauma', 'abuse']

export async function classifyWarnings(
  text: string,
  apiToken: string,
): Promise<ContentWarningTag[]> {
  const res = await fetch(`${API_URL}/ai/classify-warnings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiToken}`,
    },
    body: JSON.stringify({ text }),
  })
  if (!res.ok) return []
  const data = await res.json() as { warnings: ContentWarningTag[] }
  return data.warnings ?? []
}
