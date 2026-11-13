import { Button } from '@awakr/awake-ui/button'
import { Loading } from '@awakr/awake-ui/loading'
import { CheckIcon, XIcon } from '@/components/ui/icons'
import type { AIState, AILanguage } from '@/hooks/useAI'
import './AIActionBar.css'

interface Props {
  state: AIState
  onAccept: () => void
  onDismiss: () => void
  onPickOption: (option: string) => void
  onSelectLang: (lang: AILanguage) => void
}

const LANG_OPTIONS: { lang: AILanguage; label: string; flag: string }[] = [
  { lang: 'pt', label: 'Português', flag: '🇧🇷' },
  { lang: 'en', label: 'English', flag: '🇺🇸' },
  { lang: 'es', label: 'Español', flag: '🇪🇸' },
  { lang: 'it', label: 'Italiano', flag: '🇮🇹' },
]

export function AIActionBar({ state, onAccept, onDismiss, onPickOption, onSelectLang }: Props) {
  if (state.status === 'idle') return null

  return (
    <div className="ai-action-bar" role="toolbar" aria-label="AI suggestion">
      {state.status === 'lang-select' && (
        <div className="ai-action-bar__lang">
          <span className="ai-action-bar__label">Continue in:</span>
          {LANG_OPTIONS.map(({ lang, label, flag }) => (
            <Button
              key={lang}
              variant="outline"
              size="sm"
              onClick={() => onSelectLang(lang)}
            >
              {flag} {label}
            </Button>
          ))}
          <Button variant="ghost" size="sm" aria-label="Dismiss" onClick={onDismiss}>
            <XIcon />
          </Button>
        </div>
      )}

      {state.status === 'loading' && (
        <div className="ai-action-bar__loading">
          <Loading size="sm" />
          <span className="ai-action-bar__label">Generating…</span>
        </div>
      )}

      {state.status === 'error' && (
        <div className="ai-action-bar__error">
          <span className="ai-action-bar__label">Error — try again</span>
          <Button variant="ghost" size="sm" aria-label="Dismiss" onClick={onDismiss}>
            <XIcon />
          </Button>
        </div>
      )}

      {state.status === 'suggestion' && (
        <>
          <span className="ai-action-bar__preview" aria-live="polite">
            {state.text}
          </span>
          <div className="ai-action-bar__actions">
            <Button variant="primary" size="sm" aria-label="Accept suggestion" onClick={onAccept}>
              <CheckIcon />
              Accept
            </Button>
            <Button variant="ghost" size="sm" aria-label="Dismiss suggestion" onClick={onDismiss}>
              <XIcon />
            </Button>
          </div>
        </>
      )}

      {state.status === 'options' && (
        <div className="ai-action-bar__options">
          {state.options.map((opt) => (
            <Button
              key={opt}
              variant="outline"
              size="sm"
              onClick={() => onPickOption(opt)}
            >
              {opt}
            </Button>
          ))}
          <Button variant="ghost" size="sm" aria-label="Dismiss" onClick={onDismiss}>
            <XIcon />
          </Button>
        </div>
      )}
    </div>
  )
}
