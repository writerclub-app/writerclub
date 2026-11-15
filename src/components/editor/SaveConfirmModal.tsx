import { useEffect, useState, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import type { ContentWarningTag } from '@/services/ai.service'
import './SaveConfirmModal.css'

const COUNTDOWN = 4

interface Props {
  tags: ContentWarningTag[]
  isPublic: boolean
  onConfirm: (tags: ContentWarningTag[]) => void
  onCancel: () => void
}

export function SaveConfirmModal({ tags, isPublic, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()
  const [seconds, setSeconds] = useState(COUNTDOWN)

  const confirm = useCallback(() => onConfirm(tags), [onConfirm, tags])

  useEffect(() => {
    if (seconds <= 0) { confirm(); return }
    const id = setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => clearTimeout(id)
  }, [seconds, confirm])

  return (
    <div className="scm-overlay" role="dialog" aria-modal="true">
      <div className="scm-modal">
        <div className="scm-modal__emoji">{isPublic ? '🌍' : '📝'}</div>

        <p className="scm-modal__title">
          {isPublic ? t('editor.modal_publish_title') : t('editor.modal_save_title')}
        </p>

        {tags.length > 0 ? (
          <>
            <p className="scm-modal__sub">{t('editor.cw_ai_suggestion')}</p>
            <div className="scm-modal__tags">
              {tags.map(w => (
                <span key={w} className="scm-modal__tag">{t(`content_warnings.${w}`)}</span>
              ))}
            </div>
          </>
        ) : (
          <p className="scm-modal__sub">{t('editor.cw_no_warnings')}</p>
        )}

        <div className="scm-modal__countdown">
          <div
            className="scm-modal__countdown-bar"
            style={{ animationDuration: `${COUNTDOWN}s` }}
          />
        </div>

        <p className="scm-modal__timer">
          {t('editor.save_redirecting', { count: seconds })}
        </p>

        <Button variant="ghost" className="scm-modal__cancel" onClick={onCancel}>
          {t('editor.modal_cancel')}
        </Button>
      </div>
    </div>
  )
}
