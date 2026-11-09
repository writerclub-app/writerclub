import { Navigate, Outlet } from 'react-router-dom'
import { loadToken } from '@/services/auth.service'

export function ProtectedRoute() {
  const token = loadToken()
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}
