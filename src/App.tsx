import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { GlobalControls } from '@/components/ui/GlobalControls'
import { LoginPage } from '@/routes/login/LoginPage'
import { AuthCallbackPage } from '@/routes/auth-callback/AuthCallbackPage'

export default function App() {
  return (
    <BrowserRouter>
      <GlobalControls />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
