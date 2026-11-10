import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react'
import { loadToken } from '@/services/auth.service'
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

    void db.profile.where('authId').equals(token.authId).first().then((p) => {
      const u = p?.username && p.username !== token.authId ? p.username : null
      setUsername(u)
      setIsModalOpen(!u) // abre automaticamente se não tem username
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
