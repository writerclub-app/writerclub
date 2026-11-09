import type { OAuthToken } from '@/types/auth'
import type { OAuthProvider } from '@/types/profile'

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string

// ─── Google OAuth2 Token Client (popup, sem FedCM, sem client_secret) ────────

type TokenResponse = {
  access_token: string
  expires_in: number
  error?: string
}

type GoogleUserInfo = {
  sub: string
  email: string
  name: string
  picture: string
}

type TokenClient = {
  requestAccessToken: (cfg?: { prompt?: string }) => void
}

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (cfg: {
            client_id: string
            scope: string
            callback: (response: TokenResponse) => void
          }) => TokenClient
        }
      }
    }
  }
}

export function initiateGoogleLogin(
  onSuccess: (token: OAuthToken) => void,
  onError: () => void,
): void {
  const google = window.google
  if (!google) {
    console.error('GSI not loaded')
    onError()
    return
  }

  const client = google.accounts.oauth2.initTokenClient({
    client_id: GOOGLE_CLIENT_ID,
    scope: 'openid email profile',
    callback: async (response: TokenResponse) => {
      if (response.error || !response.access_token) {
        onError()
        return
      }
      try {
        const userInfo = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${response.access_token}` },
        }).then((r) => r.json()) as GoogleUserInfo

        const token: OAuthToken = {
          accessToken: response.access_token,
          expiresAt: Date.now() + response.expires_in * 1000,
          provider: 'google' as OAuthProvider,
          authId: userInfo.sub,
          email: userInfo.email,
          displayName: userInfo.name,
          avatarUrl: userInfo.picture,
        }
        onSuccess(token)
      } catch {
        onError()
      }
    },
  })

  client.requestAccessToken({ prompt: 'select_account' })
}

// ─── Token storage ────────────────────────────────────────────────────────────

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
