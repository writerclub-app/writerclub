import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Avatar } from '@awakr/awake-ui/avatar'
import { GlobalControls } from '@/components/ui/GlobalControls'
import { useAvatar } from '@/hooks/useAvatar'
import { loadToken } from '@/services/auth.service'
import './Navbar.css'

export function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const token = loadToken()
  const initials = token?.displayName
    ? token.displayName.charAt(0).toUpperCase()
    : '?'

  const avatarSrc = useAvatar(token?.avatarUrl)

  const links = [
    { to: '/',        label: t('nav.home') },
    { to: '/explore', label: t('nav.explore') },
    { to: '/profile', label: t('nav.profile') },
  ]

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          ✍️ {t('app.name')}
        </Link>
        <nav className="navbar-links">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`navbar-link${pathname === to ? ' navbar-link--active' : ''}`}
            >
              {label}
            </Link>
          ))}
        </nav>
        <div className="navbar-actions">
          <GlobalControls />
          <button
            className="navbar-avatar"
            onClick={() => navigate('/profile')}
            aria-label={t('nav.profile')}
          >
            <Avatar
              src={avatarSrc}
              alt={initials}
              fallback={<span>{initials}</span>}
              size="sm"
            />
          </button>
        </div>
      </div>
    </header>
  )
}
