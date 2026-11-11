import { useEffect, useState, useCallback, useDeferredValue } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { Button } from '@awakr/awake-ui/button'
import { Card } from '@awakr/awake-ui/card'
import { Badge } from '@awakr/awake-ui/badge'
import { fetchPublicWritings, fetchPublicProfile } from '@/services/api.service'
import { SearchIcon, XIcon, ChevronRightIcon } from '@/components/ui/icons'
import './ExplorePage.css'

interface PublicWriting {
  id: string
  title: string
  slug: string
  excerpt: string | null
  category_name: string | null
  published_at: string
  username: string | null
  display_name: string | null
}

interface ProfileResult {
  username: string
  displayName: string | null
  bio: string | null
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })
}

export function ExplorePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [writings, setWritings] = useState<PublicWriting[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [query, setQuery] = useState('')
  const [profileResult, setProfileResult] = useState<ProfileResult | null>(null)
  const [searchingProfile, setSearchingProfile] = useState(false)
  const deferredQuery = useDeferredValue(query)

  const load = useCallback(async (p: number) => {
    try {
      const data = (await fetchPublicWritings(p)) as PublicWriting[]
      if (p === 1) setWritings(data)
      else setWritings(prev => [...prev, ...data])
      setHasMore(data.length === 20)
    } catch { /* silent */ }
    finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => { void load(1) }, [load])

  // Search profile by @username when query starts with @
  useEffect(() => {
    const q = deferredQuery.trim()
    if (!q.startsWith('@') || q.length < 2) {
      setProfileResult(null)
      return
    }
    const username = q.slice(1)
    if (!username) return
    setSearchingProfile(true)
    fetchPublicProfile(username)
      .then(res => setProfileResult(res.profile))
      .catch(() => setProfileResult(null))
      .finally(() => setSearchingProfile(false))
  }, [deferredQuery])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    void load(next)
  }

  const q = deferredQuery.trim().toLowerCase()
  const isUserSearch = q.startsWith('@')
  const filtered = !q || isUserSearch
    ? writings
    : writings.filter(w =>
        w.title.toLowerCase().includes(q) ||
        (w.excerpt ?? '').toLowerCase().includes(q) ||
        (w.display_name ?? w.username ?? '').toLowerCase().includes(q) ||
        (w.category_name ?? '').toLowerCase().includes(q)
      )

  return (
    <div className="explore-root">
      <main className="explore-main">
        <header className="explore-header">
          <h1 className="explore-title">{t('explore.title')}</h1>
          <p className="explore-subtitle">{t('explore.subtitle')}</p>
        </header>

        {/* Search */}
        <div className="explore-search">
          <span className="explore-search__icon"><SearchIcon /></span>
          <input
            className="explore-search__input"
            type="search"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('explore.search_placeholder')}
            aria-label={t('explore.search_placeholder')}
          />
          {query && (
            <button className="explore-search__clear" onClick={() => setQuery('')}>
              <XIcon />
            </button>
          )}
        </div>

        {/* Profile result when searching @username */}
        {isUserSearch && (
          <div className="explore-profile-result">
            {searchingProfile ? (
              <Loading size="sm" label={t('explore.loading')} />
            ) : profileResult ? (
              <button
                className="explore-profile-card"
                onClick={() => void navigate(`/u/${profileResult.username}`)}
              >
                <div className="explore-profile-card__avatar">{getInitials(profileResult.displayName ?? profileResult.username)}</div>
                <div className="explore-profile-card__info">
                  <span className="explore-profile-card__name">{profileResult.displayName ?? profileResult.username}</span>
                  <span className="explore-profile-card__username">@{profileResult.username}</span>
                  {profileResult.bio && <span className="explore-profile-card__bio">{profileResult.bio}</span>}
                </div>
                <ChevronRightIcon />
              </button>
            ) : q.length > 2 ? (
              <p className="explore-profile-result__empty">{t('explore.user_not_found', { username: q.slice(1) })}</p>
            ) : null}
          </div>
        )}

        {!isUserSearch && (
          loading ? (
            <div className="explore-loading">
              <Loading size="md" label={t('explore.loading')} />
            </div>
          ) : filtered.length === 0 ? (
            <div className="explore-empty">
              <p>{q ? t('explore.no_results') : t('explore.empty')}</p>
            </div>
          ) : (
            <>
              {q && (
                <p className="explore-results-count">
                  {t('explore.results_count', { count: filtered.length })}
                </p>
              )}
              <ul className="explore-list">
                {filtered.map(w => (
                  <li key={w.id} className="explore-item">
                    <Card.Root
                      className="explore-card"
                      role="button"
                      tabIndex={0}
                      onClick={() => void navigate(`/u/${w.username ?? '_'}/${w.slug}`)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') void navigate(`/u/${w.username ?? '_'}/${w.slug}`) }}
                    >
                      <Card.Content className="explore-card__content">
                        {/* Top row: title + category badge */}
                        <div className="explore-card__header">
                          <h2 className="explore-card__title">{w.title}</h2>
                          {w.category_name && (
                            <Badge variant="info" className="explore-card__badge">
                              {w.category_name}
                            </Badge>
                          )}
                        </div>

                        {/* Excerpt */}
                        {w.excerpt && (
                          <p className="explore-card__excerpt">{w.excerpt}</p>
                        )}

                        {/* Footer: date + author */}
                        <div className="explore-card__footer">
                          <p className="explore-card__date">{formatDate(w.published_at)}</p>
                          <span className="explore-card__author">
                            @{w.username ?? t('explore.anonymous')}
                          </span>
                        </div>
                      </Card.Content>
                    </Card.Root>
                  </li>
                ))}
              </ul>

              {!q && hasMore && (
                <div className="explore-more">
                  <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore ? <Loading size="sm" label={t('explore.loading_more')} /> : t('explore.load_more')}
                  </Button>
                </div>
              )}
            </>
          )
        )}
      </main>
    </div>
  )
}
