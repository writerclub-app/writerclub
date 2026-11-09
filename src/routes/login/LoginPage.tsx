import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Loading } from '@awakr/awake-ui/loading'
import { Badge } from '@awakr/awake-ui/badge'
import './LoginPage.css'
import { initiateGoogleLogin, saveToken } from '@/services/auth.service'
import { GoogleIcon, MicrosoftIcon, GitHubIcon } from '@/components/ui/icons'
import { GlobalControls } from '@/components/ui/GlobalControls'
import { db } from '@/db'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const handleGoogle = () => {
    setLoading(true)
    initiateGoogleLogin(
      async (token) => {
        saveToken(token)
        const profile = await db.profile.get(token.authId)
        void navigate('/')
      },
      () => setLoading(false),
    )
  }

  return (
    <div className="login-root">
      <GlobalControls />

      <div className="login-wrapper">

        <header className="login-header">
          <div className="login-logomark" aria-hidden="true">✍️</div>
          <h1 className="login-title">{t('app.name')}</h1>
          <p className="login-subtitle">{t('app.tagline')}</p>
        </header>

        <div className="login-providers-card">

          <Button variant="outline" onClick={handleGoogle} disabled={loading}>
            {loading ? <Loading size="sm" label={t('auth.login.signing_in')} /> : <GoogleIcon />}
            {t('auth.login.continue_with_google')}
          </Button>

          <div className="login-divider" role="separator">
            <span className="login-divider-line" />
            <span className="login-divider-text">{t('auth.login.coming_soon')}</span>
            <span className="login-divider-line" />
          </div>

          <Button variant="outline" disabled>
            <MicrosoftIcon />
            {t('auth.login.continue_with_microsoft')}
            <Badge variant="default" className="login-soon-badge">
              {t('auth.login.coming_soon_label')}
            </Badge>
          </Button>

          <Button variant="outline" disabled>
            <GitHubIcon />
            {t('auth.login.continue_with_github')}
            <Badge variant="default" className="login-soon-badge">
              {t('auth.login.coming_soon_label')}
            </Badge>
          </Button>

        </div>

        <p
          className="login-notice"
          dangerouslySetInnerHTML={{ __html: t('auth.login.terms_notice') }}
        />
      </div>
    </div>
  )
}
