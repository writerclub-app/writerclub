import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Badge } from '@awakr/awake-ui/badge'
import type { ContentWarningTag } from '@/services/ai.service'

interface Props {
  warnings: ContentWarningTag[]
  onConfirm: (warnings: ContentWarningTag[]) => void
  onCancel: () => void
}

const ALL_TAGS: ContentWarningTag[] = ['erotic', 'violence', 'suicide', 'drugs', 'trauma', 'abuse']

export function ContentWarningsModal({ warnings, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()
  const [selected, setSelected] = useState<ContentWarningTag[]>(warnings)

  function toggle(tag: ContentWarningTag) {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className="cw-overlay" role="dialog" aria-modal="true">
      <div className="cw-modal">
        <p className="cw-modal__intro">
          {t('content_warnings.gate_title')}
        </p>
        <p className="cw-modal__sub">
          {t('editor.cw_ai_suggestion')}
        </p>
        <div className="cw-tags">
          {ALL_TAGS.map(tag => (
            <button
              key={tag}
              type="button"
              className={`cw-tag${selected.includes(tag) ? ' cw-tag--active' : ''}`}
              onClick={() => toggle(tag)}
            >
              {t(`content_warnings.${tag}`)}
            </button>
          ))}
        </div>
        <div className="cw-modal__actions">
          <Button variant="outline" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={() => onConfirm(selected)}>
            {t('editor.cw_confirm')}
          </Button>
        </div>
      </div>
    </div>
  )
}
