import { useEffect, useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { fetchPublicWritings } from '@/services/api.service'
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

export function ExplorePage() {
  const { t } = useTranslation()
  const [writings, setWritings] = useState<PublicWriting[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  const load = useCallback(async (p: number) => {
    try {
      const data = (await fetchPublicWritings(p)) as PublicWriting[]
      if (p === 1) {
        setWritings(data)
      } else {
        setWritings(prev => [...prev, ...data])
      }
      setHasMore(data.length === 20)
    } catch {
      /* silent */
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [])

  useEffect(() => {
    void load(1)
  }, [load])

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    void load(next)
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  return (
    <div className="explore-root">
      <main className="explore-main">
        <header className="explore-header">
          <h1 className="explore-title">{t('explore.title')}</h1>
          <p className="explore-subtitle">{t('explore.subtitle')}</p>
        </header>

        {loading ? (
          <div className="explore-loading">
            <Loading size="md" label={t('explore.loading')} />
          </div>
        ) : writings.length === 0 ? (
          <div className="explore-empty">
            <p>{t('explore.empty')}</p>
          </div>
        ) : (
          <>
            <ul className="explore-list">
              {writings.map(w => (
                <li key={w.id} className="explore-card">
                  <Link to={`/u/${w.username ?? '_'}/${w.slug}`} className="explore-card__link">
                    <div className="explore-card__meta">
                      {w.category_name && (
                        <span className="explore-card__category">{w.category_name}</span>
                      )}
                      <span className="explore-card__date">{formatDate(w.published_at)}</span>
                    </div>
                    <h2 className="explore-card__title">{w.title}</h2>
                    {w.excerpt && (
                      <p className="explore-card__excerpt">{w.excerpt}</p>
                    )}
                    <span className="explore-card__author">
                      {w.display_name ?? w.username ?? t('explore.anonymous')}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            {hasMore && (
              <div className="explore-more">
                <button
                  className="explore-more__btn"
                  onClick={loadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? <Loading size="sm" label={t('explore.loading_more')} /> : t('explore.load_more')}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
