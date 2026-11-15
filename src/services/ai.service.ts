const API_URL = import.meta.env.VITE_API_URL as string

export type ContentWarningTag = 'erotic' | 'violence' | 'suicide' | 'drugs' | 'trauma' | 'abuse'

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
