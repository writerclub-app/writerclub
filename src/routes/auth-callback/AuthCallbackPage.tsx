import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import './AuthCallbackPage.css'

// Callback route — reserved for future Microsoft/GitHub OAuth flows.
// Google login now uses GSI popup (no redirect needed).
export function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    void navigate('/login')
  }, [navigate])

  return null
}
