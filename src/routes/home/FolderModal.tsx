import { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { createFolder, updateFolder } from '@/services/folder.service'
import type { Folder } from '@/types/folder'
import './FolderModal.css'

interface FolderModalProps {
  /** Se passado, modo edição (renomear) */
  folder?: Folder
  onClose: () => void
  onSaved: (folder: Folder) => void
}

const NAME_MIN = 1
const NAME_MAX = 40

export function FolderModal({ folder, onClose, onSaved }: FolderModalProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const isEdit = !!folder

  const [name, setName] = useState(folder?.name ?? '')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80)
  }, [])

  function validate(value: string): string {
    const trimmed = value.trim()
    if (trimmed.length < NAME_MIN) return t('folder.error_required')
    if (trimmed.length > NAME_MAX) return t('folder.error_too_long', { max: NAME_MAX })
    return ''
  }

  async function handleSave() {
    const err = validate(name)
    if (err) { setError(err); return }
    setSaving(true)
    try {
      if (isEdit) {
        await updateFolder(folder.id, { name: name.trim() })
        onSaved({ ...folder, name: name.trim(), updatedAt: new Date() })
      } else {
        const created = await createFolder({ name: name.trim() })
        onSaved(created)
      }
      onClose()
    } catch {
      setError(t('folder.error_save'))
    } finally {
      setSaving(false)
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === 'Enter') void handleSave()
    if (e.key === 'Escape') onClose()
  }

  return (
    <div className="fmodal-backdrop" onClick={onClose} role="dialog" aria-modal>
      <div className="fmodal" onClick={(e) => e.stopPropagation()}>
        <div className="fmodal__drag" aria-hidden />

        <p className="fmodal__emoji" aria-hidden>📁</p>
        <h2 className="fmodal__title">
          {isEdit ? t('folder.rename_title') : t('folder.create_title')}
        </h2>
        <p className="fmodal__sub">
          {isEdit ? t('folder.rename_sub') : t('folder.create_sub')}
        </p>

        <div className="fmodal__field">
          <input
            ref={inputRef}
            className={`fmodal__input${error ? ' fmodal__input--error' : ''}`}
            value={name}
            maxLength={NAME_MAX}
            placeholder={t('folder.name_placeholder')}
            onChange={(e) => { setName(e.target.value); setError('') }}
            onKeyDown={handleKey}
            aria-label={t('folder.name_label')}
          />
          <span className="fmodal__char">{name.trim().length}/{NAME_MAX}</span>
        </div>

        {error && <p className="fmodal__error" role="alert">{error}</p>}

        <div className="fmodal__actions">
          <Button
            variant="primary"
            className="fmodal__btn-confirm"
            onClick={() => void handleSave()}
            disabled={saving || name.trim().length === 0}
          >
            {saving ? t('folder.saving') : isEdit ? t('folder.rename_confirm') : t('folder.create_confirm')}
          </Button>
          <Button variant="ghost" className="fmodal__btn-cancel" onClick={onClose}>
            {t('common.cancel')}
          </Button>
        </div>
      </div>
    </div>
  )
}
