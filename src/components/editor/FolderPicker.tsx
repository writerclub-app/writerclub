import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { getFolders } from '@/services/folder.service'
import { FolderIcon, ChevronDownIcon, MinusCircleIcon } from '@/components/ui/icons'
import type { Folder } from '@/types/folder'
import './FolderPicker.css'

interface FolderPickerProps {
  folderId?: string
  onSelect: (folderId: string | undefined) => void
}

export function FolderPicker({ folderId, onSelect }: FolderPickerProps) {
  const { t } = useTranslation()
  const [folders, setFolders] = useState<Folder[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    void getFolders().then(setFolders)
  }, [])

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  if (folders.length === 0) return null

  const current = folders.find((f) => f.id === folderId)

  return (
    <div className="folder-picker" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        className={`folder-picker__trigger${open ? ' folder-picker__trigger--open' : ''}`}
        onClick={() => setOpen((v) => !v)}
        aria-label={t('editor.folder_picker', 'Escolher pasta')}
      >
        <FolderIcon />
        <span>{current ? current.name : t('editor.no_folder', 'Sem pasta')}</span>
        <ChevronDownIcon />
      </Button>

      {open && (
        <div className="folder-picker__dropdown" role="listbox">
          <Button
            variant="ghost"
            className={`folder-picker__item${!folderId ? ' folder-picker__item--active' : ''}`}
            role="option"
            aria-selected={!folderId}
            onClick={() => { onSelect(undefined); setOpen(false) }}
          >
            <MinusCircleIcon />
            {t('editor.no_folder', 'Sem pasta')}
          </Button>

          {folders.map((f) => (
            <Button
              key={f.id}
              variant="ghost"
              className={`folder-picker__item${folderId === f.id ? ' folder-picker__item--active' : ''}`}
              role="option"
              aria-selected={folderId === f.id}
              onClick={() => { onSelect(f.id); setOpen(false) }}
            >
              <FolderIcon />
              {f.name}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}
