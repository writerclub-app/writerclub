import { Card } from '@awakr/awake-ui/card'
import { Skeleton } from '@/components/ui/Skeleton'
import './FolderCard.css'

export function FolderCardSkeleton() {
  return (
    <Card.Root className="folder-card" style={{ pointerEvents: 'none' }}>
      <Card.Content className="folder-card__content">
        <Skeleton className="folder-card__icon" width="40px" height="40px" style={{ borderRadius: '10px' }} />
        <div className="folder-card__info">
          <Skeleton width="50%" height="18px" />
          <Skeleton width="30%" height="14px" />
        </div>
      </Card.Content>
    </Card.Root>
  )
}
