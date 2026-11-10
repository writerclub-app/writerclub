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
