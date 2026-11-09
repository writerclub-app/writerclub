import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BottomNav } from '@awakr/awake-ui/bottom-nav'
import { HomeIcon, ExploreIcon, NewIcon, ProfileIcon } from '@/components/ui/icons'
import { Navbar } from './Navbar'
import { MobileHeader } from './MobileHeader'
import './AppLayout.css'

export function AppLayout() {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const navItems = [
    { to: '/',             icon: <HomeIcon />,    label: t('nav.home') },
    { to: '/explore',      icon: <ExploreIcon />, label: t('nav.explore') },
    { to: '/writings/new', icon: <NewIcon />,     label: t('nav.new') },
    { to: '/profile',      icon: <ProfileIcon />, label: t('nav.profile') },
  ]

  return (
    <div className="app-layout">
      <Navbar />
      <MobileHeader />
      <main className="app-layout__main">
        <Outlet />
      </main>
      <div className="app-layout__bottom-nav">
        <BottomNav.Root>
          {navItems.map(({ to, icon, label }) => (
            <BottomNav.Item
              key={to}
              icon={icon}
              label={label}
              active={pathname === to}
              onClick={() => navigate(to)}
            />
          ))}
        </BottomNav.Root>
      </div>
    </div>
  )
}
