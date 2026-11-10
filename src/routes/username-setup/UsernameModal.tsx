import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { useUsername } from '@/contexts/UsernameContext'
import { loadToken } from '@/services/auth.service'
import { db } from '@/db'
import { validateUsername, suggestUsernames, normalizeUsername } from '@/utils/username'
import './UsernameModal.css'

interface UsernameModalProps {
  /** Se true, não mostra o link "fazer depois" e bloqueia fechar */
  required?: boolean
  /** Aviso extra quando chamado a partir de uma ação bloqueada */
  warningMessage?: string
}

export function UsernameModal({ required = false, warningMessage }: UsernameModalProps) {
  const { t } = useTranslation()
  const { closeModal, onUsernameSet } = useUsername()
  const token = loadToken()

  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
    if (token?.displayName) {
      setSuggestions(suggestUsernames(token.displayName))
    }
  }, [token?.displayName])

  function handleChange(raw: string) {
    const normalized = normalizeUsername(raw)
    setValue(normalized)
    if (error) setError(null)
  }

  async function checkUnique(username: string): Promise<boolean> {
    const existing = await db.profile.where('username').equals(username).first()
    return !existing
  }

  async function handleConfirm() {
    const trimmed = value.trim()

    // validação de formato
    const formatError = validateUsername(trimmed)
    if (formatError) { setError(formatError); return }

    setSaving(true)
    try {
      // unicidade local
      const unique = await checkUnique(trimmed)
      if (!unique) { setError(t('username_setup.error_taken')); return }

      const now = new Date()
      const existing = await db.profile.where('authId').equals(token!.authId).first()

      if (existing) {
        await db.profile.update(existing.id, { username: trimmed, updatedAt: now })
      } else {
        await db.profile.put({
          id: crypto.randomUUID(),
          authId: token!.authId,
          username: trimmed,
          displayName: token!.displayName ?? '',
          email: token!.email ?? '',
          avatarUrl: token!.avatarUrl,
          oauthProvider: token!.provider,
          createdAt: now,
          updatedAt: now,
        })
      }

      onUsernameSet(trimmed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="umodal-backdrop" onClick={required ? undefined : closeModal}>
      <div className="umodal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="umodal__emoji">🖊️</div>

        <h2 className="umodal__title">{t('username_setup.title')}</h2>
        <p className="umodal__subtitle">
          {t('username_setup.subtitle')}{' '}
          <strong>{t('username_setup.immutable_warning')}</strong>
        </p>

        {warningMessage && (
          <div className="umodal__action-warning">{warningMessage}</div>
        )}

        <div className="umodal__field">
          <label className="umodal__label">{t('username_setup.label')}</label>
          <div className="umodal__input-wrap">
            <span className="umodal__at">@</span>
            <input
              ref={inputRef}
              className={`umodal__input${error ? ' umodal__input--error' : ''}`}
              value={value}
              maxLength={15}
              placeholder={t('username_setup.placeholder')}
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              onChange={(e) => handleChange(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') void handleConfirm() }}
            />
          </div>
          {error
            ? <span className="umodal__hint umodal__hint--error">{error}</span>
            : <span className="umodal__hint">{t('username_setup.hint')}</span>
          }
        </div>

        {/* Sugestões */}
        {suggestions.length > 0 && !value && (
          <div className="umodal__suggestions">
            <span className="umodal__suggestions-label">{t('username_setup.suggestions')}</span>
            <div className="umodal__suggestions-list">
              {suggestions.map((s) => (
                <button key={s} className="umodal__suggestion-chip" onClick={() => setValue(s)}>
                  @{s}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="umodal__info">
          🔒 {t('username_setup.info_prefix')}{' '}
          <strong>writerclub.app/@{value || t('username_setup.placeholder')}</strong>.{' '}
          {t('username_setup.info_suffix')}
        </div>

        <Button
          variant="primary"
          className="umodal__btn-confirm"
          onClick={() => void handleConfirm()}
          disabled={saving || !value}
        >
          {saving ? t('username_setup.saving') : t('username_setup.confirm')}
        </Button>

        {!required && (
          <button className="umodal__btn-skip" onClick={closeModal}>
            {t('username_setup.skip')}
          </button>
        )}
      </div>
    </div>
  )
}
