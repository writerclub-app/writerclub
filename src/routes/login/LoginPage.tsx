import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Loading } from '@awakr/awake-ui/loading'
import './LoginPage.css'
import { initiateGoogleLogin } from '@/services/auth.service'
import { GoogleIcon, MicrosoftIcon, GitHubIcon } from '@/components/ui/icons'

export function LoginPage() {
  const { t } = useTranslation()
  const [loading, setLoading] = useState(false)

  const handleGoogle = async () => {
    setLoading(true)
    await initiateGoogleLogin()
  }

  return (
    <div className="login-root">
      <div className="login-wrapper">

        <div className="login-header">
          <h1 className="login-title">{t('app.name')}</h1>
          <p className="login-subtitle">{t('app.tagline')}</p>
        </div>

        <div className="login-providers">
          <Button variant="outline" onClick={handleGoogle} disabled={loading}>
            {loading
              ? <Loading size="sm" label={t('auth.login.signing_in')} />
              : <GoogleIcon />
            }
            {t('auth.login.continue_with_google')}
          </Button>

          <Button variant="outline" disabled>
            <MicrosoftIcon />
            {t('auth.login.continue_with_microsoft')}
          </Button>

          <Button variant="outline" disabled>
            <GitHubIcon />
            {t('auth.login.continue_with_github')}
          </Button>
        </div>

        <p className="login-notice">{t('auth.login.local_storage_notice')}</p>
      </div>
    </div>
  )
}
