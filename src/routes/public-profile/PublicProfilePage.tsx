import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { fetchPublicProfile, type PublicProfile, type PublicWriting } from '@/services/api.service'
import { Avatar } from '@awakr/awake-ui/avatar'
import { Button } from '@awakr/awake-ui/button'
import { GlobalControls } from '@/components/ui/GlobalControls'
import './PublicProfilePage.css'

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { t } = useTranslation()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [writings, setWritings] = useState<PublicWriting[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    if (!username) return
    fetchPublicProfile(username, 1)
      .then(res => {
        setProfile(res.profile)
        setWritings(res.writings)
        setHasMore(res.writings.length === 20)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username])

  const loadMore = () => {
    if (!username) return
    const next = page + 1
    setPage(next)
    setLoadingMore(true)
    fetchPublicProfile(username, next)
      .then(res => {
        setWritings(prev => [...prev, ...res.writings])
        setHasMore(res.writings.length === 20)
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingMore(false))
  }

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })

  if (loading) return (
    <div className="pp-root pp-root--center">
      <GlobalControls />
      <Loading size="md" label={t('public.loading')} />
    </div>
  )

  if (notFound || !profile) return (
    <div className="pp-root pp-root--center">
      <GlobalControls />
      <p className="pp-not-found">{t('public.profile_not_found')}</p>
    </div>
  )

  return (
    <div className="pp-root">
      <GlobalControls />

      <main className="pp-main">
        <nav className="pp-breadcrumb">
          <Link to="/explore" className="pp-breadcrumb__link">{t('nav.explore')}</Link>
        </nav>

        <header className="pp-header">
          {profile.avatarUrl && (
            <Avatar src={profile.avatarUrl} alt={profile.displayName ?? profile.username ?? ''} size="lg" />
          )}
          <div className="pp-header__info">
            <h1 className="pp-name">{profile.displayName ?? profile.username}</h1>
            <span className="pp-username">@{profile.username}</span>
            {profile.bio && <p className="pp-bio">{profile.bio}</p>}
          </div>
        </header>

        <section className="pp-writings">
          <h2 className="pp-writings__title">{t('public.writings', { count: writings.length })}</h2>

          {writings.length === 0 ? (
            <p className="pp-empty">{t('public.no_writings')}</p>
          ) : (
            <>
              <ul className="pp-list">
                {writings.map(w => (
                  <li key={w.id} className="pp-card">
                    <Link to={`/u/${username}/${w.slug}`} className="pp-card__link">
                      <div className="pp-card__meta">
                        {w.category_name && (
                          <span className="pp-card__category">{w.category_name}</span>
                        )}
                        <span className="pp-card__date">{formatDate(w.published_at)}</span>
                      </div>
                      <h3 className="pp-card__title">{w.title}</h3>
                      {w.excerpt && <p className="pp-card__excerpt">{w.excerpt}</p>}
                    </Link>
                  </li>
                ))}
              </ul>

              {hasMore && (
                <div className="pp-more">
                  <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                    {loadingMore
                      ? <Loading size="sm" label={t('explore.loading_more')} />
                      : t('explore.load_more')}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}
