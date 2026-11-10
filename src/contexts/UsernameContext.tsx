import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { loadToken } from '@/services/auth.service'
import { fetchMyProfile } from '@/services/api.service'
import { db } from '@/db'

interface UsernameContextValue {
  hasUsername: boolean
  username: string | null
  isModalOpen: boolean
  openModal: () => void
  closeModal: () => void
  onUsernameSet: (username: string) => void
}

const UsernameContext = createContext<UsernameContextValue | null>(null)

export function UsernameProvider({ children }: { children: ReactNode }) {
  const [username, setUsername] = useState<string | null>(null)
  const [checked, setChecked] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const token = loadToken()
    if (!token) { setChecked(true); return }

    void db.profile.where('authId').equals(token.authId).first().then(async (p) => {
      const local = p?.username && p.username !== token.authId ? p.username : null
      if (local) {
        setUsername(local)
        setIsModalOpen(false)
        setChecked(true)
        return
      }
      // Fallback: busca no D1 (novo device ou perfil local ausente)
      try {
        const remote = await fetchMyProfile(token.authId)
        if (remote?.username) {
          // Salva localmente para próximas visitas
          await db.profile.put({
            id: crypto.randomUUID(),
            authId: token.authId,
            username: remote.username,
            displayName: remote.displayName ?? '',
            email: token.email ?? '',
            bio: remote.bio ?? undefined,
            avatarUrl: remote.avatarUrl ?? undefined,
            oauthProvider: token.provider ?? 'google',
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          setUsername(remote.username)
          setIsModalOpen(false)
          setChecked(true)
          return
        }
      } catch { /* sem rede ou perfil ainda não criado — abre modal */ }
      setUsername(null)
      setIsModalOpen(true)
      setChecked(true)
    })
  }, [])

  const openModal  = useCallback(() => setIsModalOpen(true), [])
  const closeModal = useCallback(() => setIsModalOpen(false), [])

  const onUsernameSet = useCallback((u: string) => {
    setUsername(u)
    setIsModalOpen(false)
  }, [])

  if (!checked) return null // aguarda checar antes de renderizar

  return (
    <UsernameContext.Provider value={{
      hasUsername: !!username,
      username,
      isModalOpen,
      openModal,
      closeModal,
      onUsernameSet,
    }}>
      {children}
    </UsernameContext.Provider>
  )
}

export function useUsername() {
  const ctx = useContext(UsernameContext)
  if (!ctx) throw new Error('useUsername must be used inside UsernameProvider')
  return ctx
}
