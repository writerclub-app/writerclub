import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import './Navbar.css'

export function Navbar() {
  const { t } = useTranslation()
  const { pathname } = useLocation()

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
      </div>
    </header>
  )
}
