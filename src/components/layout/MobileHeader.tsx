import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { loadToken } from '@/services/auth.service'
import './MobileHeader.css'

export function MobileHeader() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const token = loadToken()
  const initials = token?.displayName
    ? token.displayName.charAt(0).toUpperCase()
    : '?'

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
        {token?.avatarUrl ? (
          <img src={token.avatarUrl} alt={initials} className="mobile-header__avatar-img" />
        ) : (
          <span>{initials}</span>
        )}
      </button>
    </header>
  )
}
