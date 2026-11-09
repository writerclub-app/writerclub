import { Card } from '@awakr/awake-ui/card'
import { Skeleton } from '@/components/ui/Skeleton'
import './WritingCard.css'

export function WritingCardSkeleton() {
  return (
    <Card.Root className="writing-card" style={{ pointerEvents: 'none' }}>
      <Card.Content className="writing-card__content">
        <div className="writing-card__meta">
          <Skeleton width="80px" height="20px" />
          <Skeleton width="60px" height="20px" />
        </div>
        <Skeleton width="65%" height="20px" />
        <Skeleton width="40px" height="14px" />
      </Card.Content>
    </Card.Root>
  )
}
