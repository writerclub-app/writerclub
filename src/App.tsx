import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/routes/login/LoginPage'
import { AuthCallbackPage } from '@/routes/auth-callback/AuthCallbackPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />

        {/* Rotas protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<div>Home</div>} />
            <Route path="/explore" element={<div>Explore</div>} />
            <Route path="/writings/new" element={<div>Novo texto</div>} />
            <Route path="/writings/:id" element={<div>Editar texto</div>} />
            <Route path="/folders/:id" element={<div>Pasta</div>} />
            <Route path="/profile" element={<div>Perfil</div>} />
          </Route>
        </Route>

        {/* Perfis e textos públicos */}
        <Route path="/u/:username" element={<div>Perfil público</div>} />
        <Route path="/u/:username/:slug" element={<div>Texto público</div>} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
