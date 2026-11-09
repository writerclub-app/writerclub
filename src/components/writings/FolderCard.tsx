import { Card } from '@awakr/awake-ui/card'
import { FolderIcon } from '@/components/ui/icons'
import { useTranslation } from 'react-i18next'
import type { Folder } from '@/types/folder'
import './FolderCard.css'

interface Props {
  folder: Folder
  writingsCount: number
  onClick: () => void
}

export function FolderCard({ folder, writingsCount, onClick }: Props) {
  const { t } = useTranslation()

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
      </Card.Content>
    </Card.Root>
  )
}
