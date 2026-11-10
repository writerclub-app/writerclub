import { useRef, useState } from 'react'
import { Button } from '@awakr/awake-ui/button'
import { Card } from '@awakr/awake-ui/card'
import { FolderIcon } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import type { Folder } from '@/types/folder'
import './FolderCard.css'

interface Props {
  folder: Folder
  writingsCount: number
  onClick: () => void
  onRename: () => void
  onDelete: () => void
}

export function FolderCard({ folder, writingsCount, onClick, onRename, onDelete }: Props) {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation()
    setMenuOpen((v) => !v)
  }

  function handleBlur(e: React.FocusEvent) {
    if (!menuRef.current?.contains(e.relatedTarget as Node)) {
      setMenuOpen(false)
    }
  }

  function handleRename(e: React.MouseEvent) {
    e.stopPropagation()
    setMenuOpen(false)
    onRename()
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation()
    setMenuOpen(false)
    onDelete()
  }

  return (
    <Card.Root className="folder-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}>
      <Card.Content className="folder-card__content">
        <div className="folder-card__icon">
          <FolderIcon />
        </div>
        <div className="folder-card__info">
          <h3 className="folder-card__name">{folder.name}</h3>
          <p className="folder-card__count">
            {t('home.writings_count', { count: writingsCount })}
          </p>
        </div>

        {/* Menu 3 pontos */}
        <div
          className="folder-card__menu-wrap"
          ref={menuRef}
          onBlur={handleBlur}
        >
          <Button
            variant="ghost"
            size="sm"
            className="folder-card__menu-btn"
            onClick={toggleMenu}
            aria-label={t('common.options')}
            tabIndex={0}
          >
            ···
          </Button>
          {menuOpen && (
            <div className="folder-card__dropdown" role="menu">
              <button className="folder-card__dropdown-item" role="menuitem" onClick={handleRename}>
                {t('folder.rename')}
              </button>
              <button className="folder-card__dropdown-item folder-card__dropdown-item--danger" role="menuitem" onClick={handleDelete}>
                {t('folder.delete')}
              </button>
            </div>
          )}
        </div>
      </Card.Content>
    </Card.Root>
  )
}
