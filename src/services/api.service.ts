const API_URL = import.meta.env.VITE_API_URL as string

/** Busca ou renova o JWT do Worker para o authId atual. */
async function getToken(authId: string): Promise<string> {
  const cached = sessionStorage.getItem('wc_api_token')
  if (cached) {
    // Verifica expiração (exp no payload JWT)
    try {
      const payload = JSON.parse(atob(cached.split('.')[1]))
      if (payload.exp > Math.floor(Date.now() / 1000) + 60) {
        return cached
      }
    } catch { /* ignora e renova */ }
  }

  const res = await fetch(`${API_URL}/auth/token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ authId }),
  })

  if (!res.ok) throw new Error('Failed to get API token')
  const { token } = await res.json() as { token: string }
  sessionStorage.setItem('wc_api_token', token)
  return token
}

/** Publica um writing no servidor. */
export async function publishWritingToAPI(authId: string, writing: {
  localId: string
  title: string
  slug: string
  content: string
  excerpt?: string
  categoryName?: string
}): Promise<void> {
  const token = await getToken(authId)
  const res = await fetch(`${API_URL}/writings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(writing),
  })
  if (!res.ok) throw new Error('Failed to publish writing')
}

/** Remove um writing do servidor (despublicar). */
export async function unpublishWritingFromAPI(authId: string, localId: string): Promise<void> {
  const token = await getToken(authId)
  const res = await fetch(`${API_URL}/writings/${localId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to unpublish writing')
}

/** Busca o feed público. */
export async function fetchPublicWritings(page = 1): Promise<unknown[]> {
  const res = await fetch(`${API_URL}/writings?page=${page}`)
  if (!res.ok) throw new Error('Failed to fetch writings')
  const { data } = await res.json() as { data: unknown[] }
  return data
}

export async function syncProfile(authId: string, profile: {
  username: string
  displayName?: string
  avatarUrl?: string
}): Promise<void> {
  const token = await getToken(authId)
  await fetch(`${API_URL}/profiles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(profile),
  })
}

/** Busca o perfil do usuário autenticado (username real do D1). */
export async function fetchMyProfile(authId: string): Promise<{ username: string; displayName: string | null; bio: string | null; avatarUrl: string | null } | null> {
  try {
    const token = await getToken(authId)
    const res = await fetch(`${API_URL}/profiles/me`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!res.ok) return null
    const { profile } = await res.json() as { profile: { username: string; display_name: string | null; bio: string | null; avatar_url: string | null } }
    return { username: profile.username, displayName: profile.display_name, bio: profile.bio, avatarUrl: profile.avatar_url }
  } catch {
    return null
  }
}

export interface PublicWriting {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  category_name: string | null
  published_at: string
  updated_at: string
  username: string | null
  display_name: string | null
}

export interface PublicProfile {
  username: string
  displayName: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  followerCount: number
  followingCount: number
  isFollowing: boolean
}

export interface FollowUser {
  username: string
  display_name: string | null
  avatar_url: string | null
}

export async function fetchPublicWriting(slug: string): Promise<PublicWriting> {
  const res = await fetch(`${API_URL}/writings/${slug}`)
  if (!res.ok) throw new Error('Writing not found')
  const { data } = await res.json() as { data: PublicWriting }
  return data
}

export async function fetchPublicProfile(
  username: string,
  page = 1,
  authId?: string
): Promise<{
  profile: PublicProfile
  writings: PublicWriting[]
  page: number
}> {
  const headers: Record<string, string> = {}
  if (authId) {
    try {
      const token = await getToken(authId)
      headers['Authorization'] = `Bearer ${token}`
    } catch { /* sem token — ignora */ }
  }
  const res = await fetch(`${API_URL}/profiles/${username}?page=${page}`, { headers })
  if (!res.ok) throw new Error('Profile not found')
  return res.json() as Promise<{ profile: PublicProfile; writings: PublicWriting[]; page: number }>
}

/** Seguir um usuário. */
export async function followUser(authId: string, username: string): Promise<void> {
  const token = await getToken(authId)
  const res = await fetch(`${API_URL}/follows/${username}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to follow user')
}

/** Deixar de seguir um usuário. */
export async function unfollowUser(authId: string, username: string): Promise<void> {
  const token = await getToken(authId)
  const res = await fetch(`${API_URL}/follows/${username}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to unfollow user')
}

/** Lista de seguidores de um usuário. */
export async function fetchFollowers(
  username: string,
  page = 1
): Promise<{ followers: FollowUser[]; total: number; page: number }> {
  const res = await fetch(`${API_URL}/follows/${username}/followers?page=${page}`)
  if (!res.ok) throw new Error('Failed to fetch followers')
  return res.json() as Promise<{ followers: FollowUser[]; total: number; page: number }>
}

/** Lista de quem um usuário segue. */
export async function fetchFollowing(
  username: string,
  page = 1
): Promise<{ following: FollowUser[]; total: number; page: number }> {
  const res = await fetch(`${API_URL}/follows/${username}/following?page=${page}`)
  if (!res.ok) throw new Error('Failed to fetch following')
  return res.json() as Promise<{ following: FollowUser[]; total: number; page: number }>
}

// ── Fase 4 — Feed + Curtidas ──────────────────────────────────────────────

export interface FeedWriting {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category_name: string | null
  published_at: string
  author_id: string
  username: string | null
  display_name: string | null
  avatar_url: string | null
  likes_count: number
  liked: number  // 0 | 1 (D1 retorna inteiro)
}

/** Feed de textos de quem o usuário segue. */
export async function fetchFeed(authId: string, page = 1): Promise<{ data: FeedWriting[]; page: number; limit: number }> {
  const token = await getToken(authId)
  const res = await fetch(`${API_URL}/writings/feed?page=${page}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to fetch feed')
  return res.json() as Promise<{ data: FeedWriting[]; page: number; limit: number }>
}

export interface LikesInfo {
  writingId: string
  count: number
  liked: boolean
}

/** Busca contagem de curtidas e se o usuário curtiu. */
export async function fetchLikesInfo(writingId: string, authId?: string): Promise<LikesInfo> {
  const headers: Record<string, string> = {}
  if (authId) {
    try {
      const token = await getToken(authId)
      headers['Authorization'] = `Bearer ${token}`
    } catch { /* sem token — ignora */ }
  }
  const res = await fetch(`${API_URL}/likes/${writingId}`, { headers })
  if (!res.ok) return { writingId, count: 0, liked: false }
  const { count, liked } = await res.json() as { count: number; liked: boolean }
  return { writingId, count, liked }
}

/** Curtir (liked=false) ou descurtir (liked=true) um writing. */
export async function toggleLike(authId: string, writingId: string, currentlyLiked: boolean): Promise<void> {
  const token = await getToken(authId)
  const res = await fetch(`${API_URL}/likes/${writingId}`, {
    method: currentlyLiked ? 'DELETE' : 'POST',
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) throw new Error('Failed to toggle like')
}

// ── Fase 5 — IA ──────────────────────────────────────────────────────────

export type AICommand = 'complete' | 'suggest-rhyme' | 'rewrite' | 'suggest-title' | 'suggest-slug'

/**
 * Calls the AI endpoint and streams the response token by token.
 * `onChunk` is called for each text delta; `onDone` when the stream ends.
 * Returns an AbortController so the caller can cancel mid-stream.
 */
export function streamAI(
  authId: string,
  payload: { command: AICommand; context: string; selection?: string; language?: 'pt' | 'en' | 'es' | 'it' },
  onChunk: (text: string) => void,
  onDone: () => void,
  onError: (err: Error) => void,
): AbortController {
  const controller = new AbortController()

  ;(async () => {
    try {
      const token = await getToken(authId)
      const res = await fetch(`${API_URL}/ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      })

      if (!res.ok) {
        onError(new Error(`AI request failed: ${res.status}`))
        return
      }

      const reader = res.body?.getReader()
      if (!reader) { onError(new Error('No response body')); return }

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const data = line.slice(6).trim()
          if (data === '[DONE]') { onDone(); return }
          try {
            const parsed = JSON.parse(data) as { response?: string; choices?: Array<{ delta?: { content?: string } }> }
            const text = parsed.response ?? parsed.choices?.[0]?.delta?.content ?? ""
            if (text) onChunk(text)
          } catch { /* skip malformed line */ }
        }
      }

      onDone()
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        onError(err as Error)
      }
    }
  })()

  return controller
}
