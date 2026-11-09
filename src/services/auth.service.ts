import type { OAuthToken } from '@/types/auth'
import type { OAuthProvider } from '@/types/profile'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string
const REDIRECT_URI = `${window.location.origin}/auth/callback`

// ─── PKCE helpers ────────────────────────────────────────────────────────────

function generateCodeVerifier(): string {
  const array = new Uint8Array(64)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(verifier)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

// ─── Google OAuth PKCE ───────────────────────────────────────────────────────

export async function initiateGoogleLogin(): Promise<void> {
  const verifier = generateCodeVerifier()
  const challenge = await generateCodeChallenge(verifier)

  sessionStorage.setItem('pkce_verifier', verifier)

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    code_challenge: challenge,
    code_challenge_method: 'S256',
    prompt: 'select_account',
  })

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function handleGoogleCallback(code: string): Promise<OAuthToken> {
  const verifier = sessionStorage.getItem('pkce_verifier')
  if (!verifier) throw new Error('Missing PKCE verifier')

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: GOOGLE_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code',
      code_verifier: verifier,
    }),
  })

  if (!response.ok) throw new Error('Failed to exchange code for token')

  const data = await response.json() as {
    access_token: string
    expires_in: number
    id_token: string
  }

  sessionStorage.removeItem('pkce_verifier')

  const userInfo = await fetchGoogleUserInfo(data.access_token)

  return {
    accessToken: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    provider: 'google' as OAuthProvider,
    authId: userInfo.sub,
    email: userInfo.email,
    displayName: userInfo.name,
    avatarUrl: userInfo.picture,
  }
}

async function fetchGoogleUserInfo(accessToken: string): Promise<{
  sub: string
  email: string
  name: string
  picture: string
}> {
  const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!response.ok) throw new Error('Failed to fetch user info')
  return response.json() as Promise<{ sub: string; email: string; name: string; picture: string }>
}

// ─── Token storage (sessionStorage — cleared on tab close) ───────────────────

const TOKEN_KEY = 'writerclub_token'

export function saveToken(token: OAuthToken): void {
  localStorage.setItem(TOKEN_KEY, JSON.stringify(token))
}

export function loadToken(): OAuthToken | null {
  const raw = localStorage.getItem(TOKEN_KEY)
  if (!raw) return null
  const token = JSON.parse(raw) as OAuthToken
  if (Date.now() > token.expiresAt) {
    clearToken()
    return null
  }
  return token
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}
