import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import './ConfirmDialog.css'

interface Props {
  open: boolean
  title: string
  description?: string
  confirmLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export function ConfirmDialog({ open, title, description, confirmLabel, onConfirm, onCancel }: Props) {
  const { t } = useTranslation()

  // Fechar com Escape
  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onCancel() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onCancel])

  if (!open) return null

  return (
    <div className="cdialog-overlay" onClick={onCancel} role="presentation">
      <div
        className="cdialog-sheet"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="cdialog-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="cdialog-drag" />
        <p id="cdialog-title" className="cdialog-title">{title}</p>
        {description && <p className="cdialog-desc">{description}</p>}
        <div className="cdialog-actions">
          <Button variant="danger" className="cdialog-btn" onClick={onConfirm}>
            {confirmLabel ?? t('common.delete')}
          </Button>
          <Button variant="ghost" className="cdialog-btn cdialog-btn--cancel" onClick={onCancel}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
