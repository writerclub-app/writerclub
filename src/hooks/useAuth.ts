import { useState } from 'react'
import { loadToken, clearToken } from '@/services/auth.service'
import type { OAuthToken } from '@/types/auth'

export interface AuthState {
  token: OAuthToken | null
  isAuthenticated: boolean
  logout: () => void
}

export function useAuth(): AuthState {
  // Lazy initializer — loadToken() is synchronous (localStorage), no useEffect needed
  const [token, setToken] = useState<OAuthToken | null>(() => loadToken())

  const logout = () => {
    clearToken()
    setToken(null)
  }

  return {
    token,
    isAuthenticated: token !== null,
    logout,
  }
}
