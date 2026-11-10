import { useEffect, useState, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { Button } from '@awakr/awake-ui/button'
import { Avatar } from '@awakr/awake-ui/avatar'
import { Card } from '@awakr/awake-ui/card'
import { fetchFeed, toggleLike, type FeedWriting } from '@/services/api.service'
import { loadToken } from '@/services/auth.service'
import { HeartIcon } from '@/components/ui/icons'
import './FeedPage.css'

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function FeedPage() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [writings, setWritings] = useState<FeedWriting[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(false)
  const [likeLoading, setLikeLoading] = useState<Set<string>>(new Set())

  const authId = loadToken()?.authId ?? ''

  const load = useCallback(async (p: number, append: boolean) => {
    if (!authId) return
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      const res = await fetchFeed(authId, p)
      setWritings(prev => append ? [...prev, ...res.data] : res.data)
      setHasMore(res.data.length === res.limit)
    } catch {
      if (!append) setError(true)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [authId])

  useEffect(() => { void load(1, false) }, [load])

  async function handleLike(w: FeedWriting) {
    if (!authId || likeLoading.has(w.id)) return
    setLikeLoading(prev => new Set(prev).add(w.id))
    const wasLiked = w.liked === 1
    // Optimistic update
    setWritings(prev => prev.map(x =>
      x.id === w.id
        ? { ...x, liked: wasLiked ? 0 : 1, likes_count: x.likes_count + (wasLiked ? -1 : 1) }
        : x
    ))
    try {
      await toggleLike(authId, w.id, wasLiked)
    } catch {
      // Reverter se falhar
      setWritings(prev => prev.map(x =>
        x.id === w.id
          ? { ...x, liked: wasLiked ? 1 : 0, likes_count: x.likes_count + (wasLiked ? 1 : -1) }
          : x
      ))
    } finally {
      setLikeLoading(prev => { const s = new Set(prev); s.delete(w.id); return s })
    }
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(i18n.language, {
      day: '2-digit', month: 'short', year: 'numeric',
    })
  }

  function handleLoadMore() {
    const next = page + 1
    setPage(next)
    void load(next, true)
  }

  if (loading) {
    return (
      <div className="feed-root feed-root--center">
        <Loading size="md" label={t('feed.loading')} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="feed-root feed-root--center">
        <p className="feed-empty__text">{t('feed.error')}</p>
        <Button variant="outline" onClick={() => void load(1, false)}>{t('common.retry')}</Button>
      </div>
    )
  }

  if (writings.length === 0) {
    return (
      <div className="feed-root feed-root--center">
        <div className="feed-empty">
          <p className="feed-empty__title">{t('feed.empty_title')}</p>
          <p className="feed-empty__text">{t('feed.empty_body')}</p>
          <Button variant="outline" onClick={() => void navigate('/explore')}>
            {t('nav.explore')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="feed-root">
      <ul className="feed-list">
        {writings.map(w => {
          const isLiked = w.liked === 1
          const authorName = w.display_name ?? w.username ?? '?'
          return (
            <li key={w.id}>
            <Card.Root className="feed-card">
              {/* Author row */}
              <div className="feed-card__author">
                <Avatar size="sm" fallback={getInitials(authorName)} alt={authorName ?? ''} />
                <div className="feed-card__author-info">
                  <Link to={`/u/${w.username}`} className="feed-card__author-name">
                    {authorName}
                  </Link>
                  <span className="feed-card__author-meta">
                    @{w.username} · {formatDate(w.published_at)}
                  </span>
                </div>
              </div>

              {/* Writing content */}
              <Link to={`/u/${w.username}/${w.slug}`} className="feed-card__body">
                {w.category_name && (
                  <span className="feed-card__category">{w.category_name}</span>
                )}
                <h2 className="feed-card__title">{w.title}</h2>
                {w.excerpt && <p className="feed-card__excerpt">{w.excerpt}</p>}
              </Link>

              {/* Actions */}
              <div className="feed-card__actions">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`feed-card__like-btn${isLiked ? ' feed-card__like-btn--active' : ''}`}
                  onClick={() => void handleLike(w)}
                  disabled={likeLoading.has(w.id)}
                  aria-pressed={isLiked}
                  aria-label={isLiked ? t('public.unlike') : t('public.like')}
                >
                  <HeartIcon filled={isLiked} />
                  <span>{w.likes_count > 0 ? w.likes_count : ''}</span>
                </Button>
              </div>
            </Card.Root>
            </li>
          )
        })}
      </ul>

      {hasMore && (
        <div className="feed-load-more">
          <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}>
            {loadingMore ? <Loading size="sm" /> : t('feed.load_more')}
          </Button>
        </div>
      )}
    </div>
  )
}
