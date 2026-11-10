import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@awakr/awake-ui/avatar'
import { useAvatar } from '@/hooks/useAvatar'
import { loadToken } from '@/services/auth.service'
import './MobileHeader.css'

export function MobileHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = loadToken()
  const initials = token?.displayName
    ? token.displayName.charAt(0).toUpperCase()
    : '?'

  const avatarSrc = useAvatar(token?.avatarUrl)

  return (
    <header className="mobile-header">
      <Link to="/" className="mobile-header__logo">
        ✍️ {t('app.name')}
      </Link>
      <button
        className="mobile-header__avatar"
        onClick={() => void navigate('/profile')}
        aria-label={t('nav.profile')}
      >
        <Avatar
          src={avatarSrc}
          alt={initials}
          fallback={<span>{initials}</span>}
          size="sm"
        />
      </button>
    </header>
  )
}
