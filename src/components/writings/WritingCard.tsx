import { useTranslation } from 'react-i18next'
import { Card } from '@awakr/awake-ui/card'
import { Badge } from '@awakr/awake-ui/badge'
import { PoemIcon, SongIcon, StoryIcon, ChronicleIcon } from '@/components/ui/icons'
import type { Writing } from '@/types/writing'
import './WritingCard.css'

interface Props {
  writing: Writing
  onClick: () => void
}

function CategoryIcon({ name }: { name: string }) {
  const lower = name.toLowerCase()
  if (lower.includes('music') || lower.includes('músi') || lower.includes('canci') || lower.includes('song')) return <SongIcon />
  if (lower.includes('poem') || lower.includes('verso') || lower.includes('líric')) return <PoemIcon />
  if (lower.includes('crôni') || lower.includes('croni') || lower.includes('chroni')) return <ChronicleIcon />
  return <StoryIcon />
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(new Date(date))
}

export function WritingCard({ writing, onClick }: Props) {
  const { t } = useTranslation()

  return (
    <Card.Root className="writing-card" onClick={onClick} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}>
      <Card.Content className="writing-card__content">
        <div className="writing-card__meta">
          <Badge className="writing-card__type-badge">
            <CategoryIcon name={writing.categoryName} />
            {writing.categoryName}
          </Badge>
          <Badge
            variant={writing.isPublic ? 'success' : 'default'}
            className="writing-card__status-badge"
          >
            {writing.isPublic ? t('home.published') : t('home.draft')}
          </Badge>
        </div>
        <h3 className="writing-card__title">{writing.title || t('home.untitled')}</h3>
        <p className="writing-card__date">{formatDate(writing.updatedAt)}</p>
      </Card.Content>
    </Card.Root>
  )
}
