import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { fetchPublicProfile, followUser, unfollowUser, type PublicProfile, type PublicWriting } from '@/services/api.service'
import { Avatar } from '@awakr/awake-ui/avatar'
import { Button } from '@awakr/awake-ui/button'
import { GlobalControls } from '@/components/ui/GlobalControls'
import { useAuth } from '@/hooks/useAuth'
import './PublicProfilePage.css'

export function PublicProfilePage() {
  const { username } = useParams<{ username: string }>()
  const { t } = useTranslation()
  const { token } = useAuth()
  const [profile, setProfile] = useState<PublicProfile | null>(null)
  const [writings, setWritings] = useState<PublicWriting[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [page, setPage] = useState(1)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [followLoading, setFollowLoading] = useState(false)
  const [isFollowingLocal, setIsFollowingLocal] = useState(false)

  useEffect(() => {
    if (!username) return
    fetchPublicProfile(username, 1, token?.authId ?? undefined)
      .then(res => {
        setProfile(res.profile)
        setWritings(res.writings)
        setHasMore(res.writings.length === 20)
        setIsFollowingLocal(res.profile.isFollowing)
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

  const handleFollow = async () => {
    if (!token?.authId || !username) return
    setFollowLoading(true)
    try {
      if (isFollowingLocal) {
        await unfollowUser(token.authId, username)
        setIsFollowingLocal(false)
        setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount - 1 } : prev)
      } else {
        await followUser(token.authId, username)
        setIsFollowingLocal(true)
        setProfile(prev => prev ? { ...prev, followerCount: prev.followerCount + 1 } : prev)
      }
    } catch { /* silent */ } finally {
      setFollowLoading(false)
    }
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
            <div className="pp-header__top">
              <div>
                <h1 className="pp-name">{profile.displayName ?? profile.username}</h1>
                <span className="pp-username">@{profile.username}</span>
              </div>
              {token && profile.username !== username && (
                <Button
                  variant={isFollowingLocal ? 'outline' : 'primary'}
                  size="sm"
                  onClick={handleFollow}
                  disabled={followLoading}
                >
                  {followLoading
                    ? <Loading size="sm" />
                    : isFollowingLocal ? t('follows.unfollow') : t('follows.follow')}
                </Button>
              )}
            </div>
            <div className="pp-stats">
              <Link to={`/u/${username}/followers`} className="pp-stat">
                <span className="pp-stat__count">{profile.followerCount}</span>
                <span className="pp-stat__label">{t('follows.followers')}</span>
              </Link>
              <Link to={`/u/${username}/following`} className="pp-stat">
                <span className="pp-stat__count">{profile.followingCount}</span>
                <span className="pp-stat__label">{t('follows.following')}</span>
              </Link>
            </div>
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
