import { Navigate, Outlet } from 'react-router-dom'
import { loadToken } from '@/services/auth.service'
import { UsernameProvider, useUsername } from '@/contexts/UsernameContext'
import { UsernameModal } from '@/routes/username-setup/UsernameModal'

function ProtectedContent() {
  const { isModalOpen } = useUsername()
  return (
    <>
      <Outlet />
      {isModalOpen && <UsernameModal />}
    </>
  )
}

export function ProtectedRoute() {
  const token = loadToken()
  if (!token) return <Navigate to="/login" replace />
  return (
    <UsernameProvider>
      <ProtectedContent />
    </UsernameProvider>
  )
}
