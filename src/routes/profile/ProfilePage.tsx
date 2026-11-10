import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Avatar } from '@awakr/awake-ui/avatar'
import { Separator } from '@awakr/awake-ui/separator'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { EditIcon } from '@/components/ui/icons'
import { useAvatar } from '@/hooks/useAvatar'
import { useUsername } from '@/contexts/UsernameContext'
import { loadToken } from '@/services/auth.service'
import { db } from '@/db'
import type { Writing } from '@/types/writing'
import './ProfilePage.css'

export function ProfilePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = loadToken()
  const { username } = useUsername()

  const [displayName, setDisplayName] = useState(token?.displayName ?? '')
  const [bio, setBio] = useState('')
  const [writingCount, setWritingCount] = useState(0)
  const [recentWritings, setRecentWritings] = useState<Writing[]>([])

  const avatarSrc = useAvatar(token?.avatarUrl)
  const initials = displayName.trim()[0]?.toUpperCase() ?? '?'

  useEffect(() => {
    if (!token) return
    void db.profile.where('authId').equals(token.authId).first().then((p) => {
      if (p?.displayName) setDisplayName(p.displayName)
      if (p?.bio) setBio(p.bio)
    })
    void db.writings.count().then(setWritingCount)
    void db.writings.orderBy('updatedAt').reverse().limit(5).toArray().then(setRecentWritings)
  }, [token])

  return (
    <div className="profile-page">
      <header className="profile-topbar">
        <span className="profile-topbar__title">{t('profile.view_title', 'Meu Perfil')}</span>
        <div className="profile-topbar__right">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            className="profile-btn-edit"
            onClick={() => navigate('/profile/edit')}
            aria-label={t('profile.edit')}
          >
            <EditIcon />
            {t('profile.edit', 'Editar')}
          </Button>
        </div>
      </header>

      <main className="profile-main profile-main--view">

        {/* Header do perfil */}
        <div className="profile-view-header">
          <Avatar
            src={avatarSrc}
            alt={initials}
            fallback={<span>{initials}</span>}
            size="lg"
            className="profile-avatar"
          />
          <div className="profile-view-info">
            <div className="profile-view-name">{displayName || t('profile.name_placeholder')}</div>
            {username && (
              <div className="profile-view-username">@{username}</div>
            )}
            {bio && (
              <p className="profile-view-bio">{bio}</p>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="profile-view-stats">
          <div className="profile-stat">
            <span className="profile-stat__num">{writingCount}</span>
            <span className="profile-stat__label">{t('profile.stat_texts', 'Textos')}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">0</span>
            <span className="profile-stat__label">{t('profile.stat_followers', 'Seguidores')}</span>
          </div>
          <div className="profile-stat">
            <span className="profile-stat__num">0</span>
            <span className="profile-stat__label">{t('profile.stat_following', 'Seguindo')}</span>
          </div>
        </div>

        <Separator className="profile-sep" />

        {/* Textos recentes */}
        <div className="profile-section-title">{t('profile.recent_writings', 'Textos recentes')}</div>

        {recentWritings.length === 0 ? (
          <div className="profile-empty">
            <span className="profile-empty__icon">✍️</span>
            <span className="profile-empty__text">{t('profile.no_writings', 'Nenhum texto ainda')}</span>
          </div>
        ) : (
          <div className="profile-writing-list">
            {recentWritings.map((w) => (
              <button
                key={w.id}
                className="profile-writing-item"
                onClick={() => navigate(`/writings/${w.id}`)}
              >
                <span className="profile-writing-item__title">{w.title || t('editor.untitled')}</span>
                <span className="profile-writing-item__date">
                  {new Date(w.updatedAt).toLocaleDateString()}
                </span>
              </button>
            ))}
          </div>
        )}

      </main>
    </div>
  )
}
