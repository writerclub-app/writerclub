import { Button } from '@awakr/awake-ui/button'
import { Loading } from '@awakr/awake-ui/loading'
import { CheckIcon, XIcon } from '@/components/ui/icons'
import type { AICommand } from '@/services/api.service'
import type { AIState, AILanguage } from '@/hooks/useAI'
import './AIActionBar.css'

interface Props {
  state: AIState
  hasSelection: boolean
  onRun: (command: AICommand) => void
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

export function AIActionBar({
  state,
  hasSelection,
  onRun,
  onAccept,
  onDismiss,
  onPickOption,
  onSelectLang,
}: Props) {
  return (
    <div className="ai-action-bar" role="toolbar" aria-label="AI tools">

      {state.status === 'idle' && (
        <div className="ai-action-bar__idle">
          <Button variant="ghost" size="sm" onClick={() => onRun('complete')}>
            ✦ Complete
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasSelection}
            onClick={() => onRun('rewrite')}
          >
            ✦ Rewrite
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={!hasSelection}
            onClick={() => onRun('suggest-rhyme')}
          >
            ♪ Rhyme
          </Button>
          <Button variant="ghost" size="sm" onClick={() => onRun('suggest-title')}>
            T Title
          </Button>
        </div>
      )}

      {state.status === 'lang-select' && (
        <div className="ai-action-bar__lang">
          <span className="ai-action-bar__label">Continue in:</span>
          {LANG_OPTIONS.map(({ lang, label }) => (
            <Button key={lang} variant="outline" size="sm" onClick={() => onSelectLang(lang)}>
              {label}
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
          <Button variant="ghost" size="sm" aria-label="Cancel" onClick={onDismiss}>
            <XIcon />
          </Button>
        </div>
      )}

      {state.status === 'error' && (
        <div className="ai-action-bar__error">
          <span className="ai-action-bar__label">{state.message ?? 'Error — try again'}</span>
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
            <Button variant="primary" size="sm" aria-label="Accept" onClick={onAccept}>
              <CheckIcon /> Accept
            </Button>
            <Button variant="ghost" size="sm" aria-label="Dismiss" onClick={onDismiss}>
              <XIcon />
            </Button>
          </div>
        </>
      )}

      {state.status === 'options' && (
        <div className="ai-action-bar__options">
          {state.options.map((opt) => (
            <Button key={opt} variant="outline" size="sm" onClick={() => onPickOption(opt)}>
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
