import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { handleGoogleCallback, saveToken } from '@/services/auth.service'
import './AuthCallbackPage.css'
import { db } from '@/db'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')
    const error = params.get('error')

    if (error || !code) {
      void navigate('/login')
      return
    }

    handleGoogleCallback(code)
      .then(async (token) => {
        saveToken(token)
        const profile = await db.profile.get(token.authId)
        void navigate(profile ? '/' : '/onboarding')
      })
      .catch(() => void navigate('/login'))
  }, [navigate])

  return (
    <div className="callback-root">
      <p className="callback-text">{t('auth.callback.signing_in')}</p>
    </div>
  )
}
