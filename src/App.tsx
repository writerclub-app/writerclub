import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/auth/ProtectedRoute'
import { LoginPage } from '@/routes/login/LoginPage'
import { HomePage } from '@/routes/home/HomePage'
import { EditorPage } from '@/routes/editor/EditorPage'
import { ProfilePage } from '@/routes/profile/ProfilePage'
import { ProfileEditPage } from '@/routes/profile/ProfileEditPage'
import { FolderPage } from '@/routes/folder/FolderPage'
import { AuthCallbackPage } from '@/routes/auth-callback/AuthCallbackPage'
import { ExplorePage } from '@/routes/explore/ExplorePage'
import { PublicWritingPage } from '@/routes/public-writing/PublicWritingPage'
import { PublicProfilePage } from '@/routes/public-profile/PublicProfilePage'
import { FollowListPage } from '@/routes/follow-list/FollowListPage'
import { FeedPage } from '@/routes/feed/FeedPage'

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
            <Route path="/" element={<HomePage />} />
            <Route path="/feed" element={<FeedPage />} />
            <Route path="/explore" element={<ExplorePage />} />
            <Route path="/writings/new" element={<EditorPage />} />
            <Route path="/writings/:id" element={<EditorPage />} />
            <Route path="/folders/:id" element={<FolderPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/edit" element={<ProfileEditPage />} />
          </Route>
        </Route>

        {/* Perfis e textos públicos */}
        <Route path="/u/:username/followers" element={<FollowListPage type="followers" />} />
        <Route path="/u/:username/following" element={<FollowListPage type="following" />} />
        <Route path="/u/:username" element={<PublicProfilePage />} />
        <Route path="/u/:username/:slug" element={<PublicWritingPage />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
