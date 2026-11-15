import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Field } from '@awakr/awake-ui/field'
import { Loading } from '@awakr/awake-ui/loading'
import { Badge } from '@awakr/awake-ui/badge'
import './LoginPage.css'
import {
  initiateGoogleLogin,
  saveToken,
  registerWithEmail,
  loginWithEmail,
} from '@/services/auth.service'
import { syncProfile } from '@/services/api.service'
import { GoogleIcon, MicrosoftIcon } from '@/components/ui/icons'
import { GlobalControls } from '@/components/ui/GlobalControls'
import type { OAuthToken } from '@/types/auth'

type Mode = 'options' | 'login' | 'register'

export function LoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mode, setMode] = useState<Mode>('options')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')

  function resetForm() {
    setError(null)
    setEmail('')
    setPassword('')
    setUsername('')
    setDisplayName('')
  }

  function goTo(m: Mode) {
    resetForm()
    setMode(m)
  }

  async function afterOAuth(token: OAuthToken) {
    saveToken(token)
    const usernameSlug = (token.email?.split('@')[0] ?? token.authId.slice(0, 12))
      .toLowerCase().replace(/[^a-z0-9]/g, '')
    void syncProfile(token.authId, {
      username: usernameSlug,
      displayName: token.displayName ?? undefined,
      avatarUrl: token.avatarUrl ?? undefined,
    }).catch(() => { /* silent */ })
    void navigate('/')
  }

  function handleGoogle() {
    setLoading(true)
    setError(null)
    initiateGoogleLogin(
      (token) => void afterOAuth(token),
      () => { setLoading(false); setError(t('auth.login.error_generic')) },
    )
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password) return
    setLoading(true)
    setError(null)
    try {
      const result = await loginWithEmail(email, password)
      const token: OAuthToken = {
        accessToken: result.token,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        provider: 'email',
        authId: result.authId,
        email,
        displayName: result.displayName ?? result.username,
        avatarUrl: result.avatarUrl,
      }
      saveToken(token)
      sessionStorage.setItem('wc_api_token', result.token)
      void navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.error_generic'))
    } finally {
      setLoading(false)
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !password || !username) return
    setLoading(true)
    setError(null)
    try {
      const result = await registerWithEmail(email, password, username, displayName || undefined)
      const token: OAuthToken = {
        accessToken: result.token,
        expiresAt: Date.now() + 7 * 24 * 60 * 60 * 1000,
        provider: 'email',
        authId: result.authId,
        email,
        displayName: displayName || result.username,
        avatarUrl: undefined,
      }
      saveToken(token)
      sessionStorage.setItem('wc_api_token', result.token)
      void navigate('/')
    } catch (err) {
      setError(err instanceof Error ? err.message : t('auth.login.error_generic'))
    } finally {
      setLoading(false)
    }
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

          {mode === 'options' && (
            <>
              <Button variant="outline" onClick={() => goTo('login')}>
                {t('auth.login.enter_with_email')}
              </Button>

              <Button variant="outline" onClick={() => goTo('register')}>
                {t('auth.login.create_account')}
              </Button>

              <div className="login-divider" role="separator">
                <span className="login-divider-line" />
                <span className="login-divider-text">{t('auth.login.or')}</span>
                <span className="login-divider-line" />
              </div>

              <Button variant="outline" onClick={handleGoogle} disabled={loading}>
                {loading ? <Loading size="sm" /> : <GoogleIcon />}
                {t('auth.login.continue_with_google')}
              </Button>

              <Button variant="outline" disabled>
                <MicrosoftIcon />
                {t('auth.login.continue_with_microsoft')}
                <Badge className="login-soon-badge">
                  {t('auth.login.coming_soon_label')}
                </Badge>
              </Button>
            </>
          )}

          {mode === 'login' && (
            <form onSubmit={(e) => void handleLogin(e)} className="login-form">
              <p className="login-form-title">{t('auth.login.enter_with_email')}</p>

              <Field.Root>
                <Field.Label>{t('auth.login.email')}</Field.Label>
                <Field.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{t('auth.login.password')}</Field.Label>
                <Field.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field.Root>

              {error && <p className="login-error">{error}</p>}

              <Button variant="primary" type="submit" disabled={loading} className="login-submit">
                {loading ? <Loading size="sm" /> : t('auth.login.enter')}
              </Button>

              <button type="button" className="login-toggle" onClick={() => goTo('options')}>
                ← {t('auth.login.back')}
              </button>
            </form>
          )}

          {mode === 'register' && (
            <form onSubmit={(e) => void handleRegister(e)} className="login-form">
              <p className="login-form-title">{t('auth.login.create_account')}</p>

              <Field.Root>
                <Field.Label>{t('auth.login.email')}</Field.Label>
                <Field.Control
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{t('auth.login.username')}</Field.Label>
                <Field.Control
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{t('auth.login.display_name')}</Field.Label>
                <Field.Control
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                />
              </Field.Root>

              <Field.Root>
                <Field.Label>{t('auth.login.password')}</Field.Label>
                <Field.Control
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </Field.Root>

              {error && <p className="login-error">{error}</p>}

              <Button variant="primary" type="submit" disabled={loading} className="login-submit">
                {loading ? <Loading size="sm" /> : t('auth.login.register')}
              </Button>

              <button type="button" className="login-toggle" onClick={() => goTo('options')}>
                ← {t('auth.login.back')}
              </button>
            </form>
          )}

        </div>

        <p
          className="login-notice"
          dangerouslySetInnerHTML={{ __html: t('auth.login.terms_notice') }}
        />
      </div>
    </div>
  )
}
