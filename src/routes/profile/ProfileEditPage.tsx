import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Avatar } from '@awakr/awake-ui/avatar'
import { Field } from '@awakr/awake-ui/field'
import { Separator } from '@awakr/awake-ui/separator'
import { useToast } from '@awakr/awake-ui/toast'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSelector } from '@/components/ui/LanguageSelector'
import { PaletteSelector } from '@/components/ui/PaletteSelector'
import { ArrowLeftIcon, LockIcon, LogoutIcon, DownloadIcon } from '@/components/ui/icons'
import { useAvatar } from '@/hooks/useAvatar'
import { useUsername } from '@/contexts/UsernameContext'
import { loadToken, clearToken } from '@/services/auth.service'
import { db } from '@/db'
import { getActiveProvider } from '@/services/backup.service'
import { ProviderPicker, BackupStatus } from '@/components/backup'
import { usePwaInstall } from '@/hooks/usePwaInstall'
import './ProfileEditPage.css'

const BIO_MAX = 160
const NAME_MAX = 50

export function ProfileEditPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { toast } = useToast()
  const token = loadToken()
  const { username, openModal } = useUsername()

  const [displayName, setDisplayName] = useState(token?.displayName ?? '')
  const [bio, setBio] = useState('')
  const [saving, setSaving] = useState(false)
  const [backupConnected, setBackupConnected] = useState(() => !!getActiveProvider())
  const { canInstall, install } = usePwaInstall()

  const avatarSrc = useAvatar(token?.avatarUrl)
  const initials = displayName.trim()[0]?.toUpperCase() ?? '?'

  // Load profile from local DB
  useEffect(() => {
    if (!token) return
    void db.profile.where('authId').equals(token.authId).first().then((p) => {
      if (p?.bio) setBio(p.bio)
      if (p?.displayName) setDisplayName(p.displayName)
    })
  }, [token])

  async function handleSave() {
    if (!token) return
    setSaving(true)
    try {
      const existing = await db.profile.where('authId').equals(token.authId).first()
      if (existing) {
        await db.profile.update(existing.id, {
          displayName,
          bio,
          updatedAt: new Date(),
        })
      } else {
        await db.profile.put({
          id: crypto.randomUUID(),
          authId: token.authId,
          username: '',
          displayName,
          email: token.email,
          bio,
          avatarUrl: token.avatarUrl,
          oauthProvider: token.provider,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }
      toast({ message: t('profile.saved'), variant: 'success' })
    } finally {
      setSaving(false)
    }
  }

  function handleLogout() {
    clearToken()
    navigate('/login', { replace: true })
  }

  return (
    <div className="profile-page">
      {/* Topbar */}
      <header className="profile-topbar">
        <div className="profile-topbar__left">
          <Button variant="ghost" size="sm" className="profile-btn-back" onClick={() => navigate('/profile')} aria-label={t('editor.back')}>
            <ArrowLeftIcon />
          </Button>
          <span className="profile-topbar__title">{t('profile.title')}</span>
        </div>
        <ThemeToggle />
      </header>

      <main className="profile-main">

        {/* Avatar */}
        <div className="profile-avatar-section">
          <div className="profile-avatar-wrap">
            <Avatar
              src={avatarSrc}
              alt={initials}
              fallback={<span>{initials}</span>}
              size="lg"
              className="profile-avatar"
            />
          </div>
          <span className="profile-avatar-hint">{t('profile.avatar_hint')}</span>
        </div>

        {/* Form */}
        <div className="profile-form">

          {/* Display name */}
          <Field.Root className="profile-field">
            <Field.Label className="profile-field__label">
              {t('profile.name_label')}
              <span className={`profile-char-count${displayName.length > NAME_MAX * 0.9 ? ' profile-char-count--warn' : ''}`}>
                {displayName.length} / {NAME_MAX}
              </span>
            </Field.Label>
            <Field.Control
              className="profile-field__input"
              value={displayName}
              maxLength={NAME_MAX}
              placeholder={t('profile.name_placeholder')}
              onChange={(e) => setDisplayName((e.target as HTMLInputElement).value)}
            />
          </Field.Root>

          {/* Username — readonly */}
          <Field.Root className="profile-field">
            <Field.Label className="profile-field__label">{t('profile.username_label')}</Field.Label>
            <Field.Control
              className="profile-field__input profile-field__input--readonly"
              value={username ? `@${username}` : ''}
              placeholder={t('profile.username_not_set', '@—')}
              readOnly
            />
            {username ? (
              <div className="profile-field__lock">
                <LockIcon />
                {t('profile.username_locked')}
              </div>
            ) : (
              <Button variant="ghost" className="profile-field__lock profile-field__lock--choose" onClick={openModal}>
                {t('profile.username_choose', 'Escolher @username')}
              </Button>
            )}
          </Field.Root>

          {/* Bio */}
          <Field.Root className="profile-field">
            <Field.Label className="profile-field__label">
              {t('profile.bio_label')}
              <span className={`profile-char-count${bio.length > BIO_MAX * 0.9 ? ' profile-char-count--warn' : ''}`}>
                {bio.length} / {BIO_MAX}
              </span>
            </Field.Label>
            <Field.Control
              render={<textarea />}
              className="profile-field__input profile-field__input--textarea"
              value={bio}
              maxLength={BIO_MAX}
              placeholder={t('profile.bio_placeholder')}
              onChange={(e) => setBio((e.target as unknown as HTMLTextAreaElement).value)}
            />
          </Field.Root>

          <Separator className="profile-sep" />

          {/* Appearance */}
          <div className="profile-section-title">{t('profile.appearance')}</div>

          <div className="profile-setting-row">
            <div className="profile-setting-row__left">
              <span className="profile-setting-row__icon">🎨</span>
              <span className="profile-setting-row__label">{t('palette.label')}</span>
            </div>
            <PaletteSelector />
          </div>

          <div className="profile-setting-row">
            <div className="profile-setting-row__left">
              <span className="profile-setting-row__icon">🌐</span>
              <span className="profile-setting-row__label">{t('profile.language')}</span>
            </div>
            <LanguageSelector />
          </div>

          {canInstall && (
            <div className="profile-setting-row">
              <div className="profile-setting-row__left">
                <span className="profile-setting-row__icon"><DownloadIcon /></span>
                <span className="profile-setting-row__label">{t('profile.install_app', 'Instalar app')}</span>
              </div>
              <Button variant="secondary" size="sm" onClick={() => void install()}>
                {t('profile.install', 'Instalar')}
              </Button>
            </div>
          )}

          <Separator className="profile-sep" />

          <Separator className="profile-sep" />

          {/* Backup (BYOS) */}
          <div className="profile-section-title">{t('backup.title')}</div>
          {backupConnected
            ? <BackupStatus onDisconnect={() => setBackupConnected(false)} />
            : <ProviderPicker onConnected={() => setBackupConnected(true)} />
          }

          <Separator className="profile-sep" />

          {/* Save */}
          <Button
            variant="primary"
            className="profile-btn-save"
            onClick={() => void handleSave()}
            disabled={saving}
          >
            {saving ? t('profile.saving') : t('profile.save')}
          </Button>

          <Separator className="profile-sep" />

          {/* Danger zone */}
          <div className="profile-danger-zone">
            <div className="profile-danger-title">{t('profile.danger_zone')}</div>
            <Button
              variant="ghost"
              className="profile-btn-logout"
              onClick={handleLogout}
            >
              <LogoutIcon />
              {t('profile.logout')}
            </Button>
          </div>

        </div>
      </main>
    </div>
  )
}
