import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Field } from '@awakr/awake-ui/field'
import { GitHubIcon, GoogleIcon, MicrosoftIcon } from '@/components/ui/icons'
import { githubGistProvider } from '@/services/backup/github-gist.provider'
import './ProviderPicker.css'

type Provider = 'github-gist' | 'google-drive' | 'onedrive'

interface ProviderOption {
  id: Provider
  label: string
  icon: React.ReactNode
  available: boolean
}

const PROVIDERS: ProviderOption[] = [
  { id: 'github-gist',   label: 'GitHub Gist',  icon: <GitHubIcon />,    available: true },
  { id: 'google-drive',  label: 'Google Drive', icon: <GoogleIcon />,    available: false },
  { id: 'onedrive',      label: 'OneDrive',     icon: <MicrosoftIcon />, available: false },
]

interface Props {
  onConnected: () => void
}

export function ProviderPicker({ onConnected }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<Provider | null>(null)
  const [pat, setPat] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleConnect() {
    if (selected === 'github-gist') {
      if (!pat.trim()) return
      setLoading(true)
      setError(null)
      try {
        await githubGistProvider.validateToken(pat.trim())
        githubGistProvider.setToken(pat.trim())
        onConnected()
      } catch (err) {
        setError(err instanceof Error ? err.message : t('backup.error_connect'))
      } finally {
        setLoading(false)
      }
    }
  }

  const selectedOption = PROVIDERS.find((p) => p.id === selected)

  return (
    <div className="provider-picker">
      <p className="provider-picker__hint">{t('backup.hint')}</p>

      {/* Provider selector */}
      <div className="provider-picker__options">
        {PROVIDERS.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={!p.available}
            className={[
              'provider-picker__option',
              selected === p.id ? 'provider-picker__option--active' : '',
              !p.available ? 'provider-picker__option--soon' : '',
            ].join(' ')}
            onClick={() => { if (p.available) { setSelected(p.id); setError(null) } }}
            aria-pressed={selected === p.id}
          >
            <span className="provider-picker__option-icon">{p.icon}</span>
            <span className="provider-picker__option-label">{p.label}</span>
            {!p.available && (
              <span className="provider-picker__option-soon">{t('backup.soon')}</span>
            )}
          </button>
        ))}
      </div>

      {/* Dynamic field */}
      {/* Info block */}
      {selected === 'github-gist' && (
        <div className="provider-picker__info">
          <p className="provider-picker__info-title">ℹ️ {t('backup.github_how_title')}</p>
          <ol className="provider-picker__info-steps">
            <li>{t('backup.github_step1')}</li>
            <li>{t('backup.github_step2')}</li>
            <li>{t('backup.github_step3')}</li>
            <li>{t('backup.github_step4')}</li>
          </ol>
          <a
            href="https://github.com/settings/tokens/new?scopes=gist&description=WriterClub+backup"
            target="_blank"
            rel="noreferrer"
            className="provider-picker__link"
          >
            {t('backup.github_pat_create')} ↗
          </a>
        </div>
      )}

      {selected === 'github-gist' && (
        <div className="provider-picker__form">
          <Field.Root>
            <Field.Label>{t('backup.github_pat_label')}</Field.Label>
            <Field.Control
              type="password"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
              value={pat}
              onChange={(e) => { setPat(e.target.value); setError(null) }}
              onKeyDown={(e: React.KeyboardEvent) => { if (e.key === 'Enter') void handleConnect() }}
            />
          </Field.Root>
          {error && <p className="provider-picker__error">{error}</p>}

          <Button
            variant="primary"
            onClick={() => void handleConnect()}
            disabled={!pat.trim() || loading}
            className="provider-picker__btn"
          >
            {loading ? t('backup.connecting') : t('backup.connect')}
          </Button>
        </div>
      )}

      {selected && selectedOption && !selectedOption.available && (
        <p className="provider-picker__coming">{t('backup.coming_soon', { provider: selectedOption.label })}</p>
      )}
    </div>
  )
}
