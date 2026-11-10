import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { Button } from '@awakr/awake-ui/button'
import { Avatar } from '@awakr/awake-ui/avatar'
import { Tabs } from '@awakr/awake-ui/tabs'
import {
  fetchFollowers,
  fetchFollowing,
  type FollowUser,
} from '@/services/api.service'
import { GlobalControls } from '@/components/ui/GlobalControls'
import './FollowListPage.css'

interface Props {
  type: 'followers' | 'following'
}

export function FollowListPage({ type }: Props) {
  const { username } = useParams<{ username: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [users, setUsers] = useState<FollowUser[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const LIMIT = 20

  useEffect(() => {
    if (!username) return
    setLoading(true)
    setUsers([])
    setPage(1)
    setHasMore(false)

    const fetcher = type === 'followers'
      ? fetchFollowers(username, 1)
      : fetchFollowing(username, 1)

    fetcher
      .then(res => {
        const list = type === 'followers' ? res.followers : res.following
        setUsers(list as FollowUser[])
        setTotal(res.total)
        setHasMore((list as FollowUser[]).length === LIMIT)
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [username, type])

  const loadMore = () => {
    if (!username) return
    const next = page + 1
    setPage(next)
    setLoadingMore(true)

    const fetcher = type === 'followers'
      ? fetchFollowers(username, next)
      : fetchFollowing(username, next)

    fetcher
      .then(res => {
        const list = type === 'followers' ? res.followers : res.following
        setUsers(prev => [...prev, ...(list as FollowUser[])])
        setHasMore((list as FollowUser[]).length === LIMIT)
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoadingMore(false))
  }

  const handleTabChange = (value: string | null) => {
    if (!value || !username) return
    navigate(value === 'followers' ? `/u/${username}/followers` : `/u/${username}/following`)
  }

  if (loading) return (
    <div className="fl-root fl-root--center">
      <GlobalControls />
      <Loading size="md" label={t('public.loading')} />
    </div>
  )

  if (notFound) return (
    <div className="fl-root fl-root--center">
      <GlobalControls />
      <p className="fl-not-found">{t('public.profile_not_found')}</p>
    </div>
  )

  return (
    <div className="fl-root">
      <GlobalControls />

      <main className="fl-main">
        <nav className="fl-breadcrumb">
          <Link to="/explore" className="fl-breadcrumb__link">{t('nav.explore')}</Link>
          <span className="fl-breadcrumb__sep">›</span>
          <Link to={`/u/${username}`} className="fl-breadcrumb__link">@{username}</Link>
          <span className="fl-breadcrumb__sep">›</span>
          <span className="fl-breadcrumb__current">
            {type === 'followers' ? t('follows.followers') : t('follows.following')}
          </span>
        </nav>

        <Tabs.Root value={type} onValueChange={handleTabChange}>
          <Tabs.List className="fl-tabs">
            <Tabs.Tab value="followers" className="fl-tab">
              {t('follows.followers')}
              {type === 'followers' && total > 0 && (
                <span className="fl-tab__count">{total}</span>
              )}
            </Tabs.Tab>
            <Tabs.Tab value="following" className="fl-tab">
              {t('follows.following')}
              {type === 'following' && total > 0 && (
                <span className="fl-tab__count">{total}</span>
              )}
            </Tabs.Tab>
            <Tabs.Indicator className="fl-tab-indicator" />
          </Tabs.List>

          <Tabs.Panel value={type} className="fl-panel">
            {users.length === 0 ? (
              <p className="fl-empty">
                {type === 'followers'
                  ? t('follows.no_followers')
                  : t('follows.no_following')}
              </p>
            ) : (
              <>
                <ul className="fl-list">
                  {users.map(u => (
                    <li key={u.username}>
                      <Link to={`/u/${u.username}`} className="fl-user-card">
                        <Avatar
                          src={u.avatar_url ?? undefined}
                          alt={u.display_name ?? u.username}
                          size="md"
                        />
                        <div className="fl-user-card__info">
                          <span className="fl-user-card__name">
                            {u.display_name ?? u.username}
                          </span>
                          <span className="fl-user-card__username">@{u.username}</span>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>

                {hasMore && (
                  <div className="fl-more">
                    <Button variant="outline" onClick={loadMore} disabled={loadingMore}>
                      {loadingMore
                        ? <Loading size="sm" label={t('explore.loading_more')} />
                        : t('explore.load_more')}
                    </Button>
                  </div>
                )}
              </>
            )}
          </Tabs.Panel>
        </Tabs.Root>
      </main>
    </div>
  )
}
