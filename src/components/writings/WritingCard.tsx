import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { Card } from '@awakr/awake-ui/card'
import { Badge } from '@awakr/awake-ui/badge'
import type { Writing } from '@/types/writing'
import './WritingCard.css'

interface Props {
  writing: Writing
  onClick: () => void
  onEdit?: () => void
  onDelete?: () => void
}

function extractPreview(content: string | undefined, maxLen = 120): string {
  if (!content) return ''
  try {
    const doc = JSON.parse(content) as { content?: unknown[] }
    const texts: string[] = []
    function walk(node: { type?: string; text?: string; content?: unknown[] }) {
      if (node.type === 'text' && node.text) texts.push(node.text)
      if (node.content) (node.content as typeof node[]).forEach(walk)
    }
    walk(doc)
    const full = texts.join(' ').trim()
    return full.length > maxLen ? full.slice(0, maxLen) + '…' : full
  } catch {
    return ''
  }
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat(undefined, { day: '2-digit', month: 'short' }).format(new Date(date))
}

export function WritingCard({ writing, onClick, onEdit, onDelete }: Props) {
  const { t } = useTranslation()
  const preview = extractPreview(writing.content)
  return (
    <div className="writing-item">
      <Card.Root className="writing-card" onClick={onClick} role="button" tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick() }}>
        <Card.Content className="writing-card__content">

          {/* Top row: title + type badge */}
          <div className="writing-card__header">
            <h3 className="writing-card__title">{writing.title || t('home.untitled')}</h3>
            <Badge variant="info" className="writing-card__type-badge">
              {writing.categoryName}
            </Badge>
          </div>

          {/* Preview */}
          {preview && <p className="writing-card__preview">{preview}</p>}

          {/* Bottom row: date + status badge */}
          <div className="writing-card__footer">
            <p className="writing-card__date">{formatDate(writing.updatedAt)}</p>
            <Badge
              variant={writing.isPublic ? 'success' : 'default'}
              className="writing-card__status-badge"
            >
              {writing.isPublic ? t('home.published') : t('home.draft')}
            </Badge>
          </div>

        </Card.Content>
      </Card.Root>

      {/* Actions below card */}
      {(onEdit || onDelete) && (
        <div className="writing-item__actions">
          {onEdit && (
            <Button variant="ghost" size="sm" className="writing-item__btn writing-item__btn--edit"
              onClick={(e) => { e.stopPropagation(); onEdit() }}>
              {t('common.edit')}
            </Button>
          )}
          {onDelete && (
            <Button variant="ghost" size="sm" className="writing-item__btn writing-item__btn--delete"
              onClick={(e) => { e.stopPropagation(); onDelete() }}>
              {t('common.delete')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
