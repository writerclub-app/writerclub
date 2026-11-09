import type { OAuthProvider } from '@/types/profile'

export interface OAuthToken {
  accessToken: string
  expiresAt: number // timestamp ms
  provider: OAuthProvider
  authId: string    // sub from token / user id from provider
  email: string
  displayName: string
  avatarUrl?: string
}

export interface AuthSession {
  token: OAuthToken
  isNewUser: boolean // true = needs username setup
}
