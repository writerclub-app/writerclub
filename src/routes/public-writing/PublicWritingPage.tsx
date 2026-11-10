import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { Button } from '@awakr/awake-ui/button'
import { Avatar } from '@awakr/awake-ui/avatar'
import { fetchPublicWriting, fetchPublicProfile, fetchLikesInfo, toggleLike, type PublicWriting } from '@/services/api.service'
import { loadToken } from '@/services/auth.service'
import { GlobalControls } from '@/components/ui/GlobalControls'
import {
  ArrowLeftIcon,
  CalendarIcon,
  EditIcon,
  HeartIcon,
  ShareIcon,
  BookmarkIcon,
} from '@/components/ui/icons'
import './PublicWritingPage.css'

function extractTextAndWords(content: string): { nodes: React.ReactNode[]; wordCount: number } {
  try {
    const doc = JSON.parse(content) as {
      content?: Array<{ type: string; content?: Array<{ text?: string }> }>
    }
    let totalWords = 0
    const nodes = (doc.content ?? []).map((node, i) => {
      const text = (node.content ?? []).map(n => n.text ?? '').join('')
      totalWords += text.trim() ? text.trim().split(/\s+/).length : 0
      if (node.type === 'heading') return <h2 key={i} className="pw-content__heading">{text}</h2>
      if (node.type === 'paragraph') return <p key={i} className="pw-content__paragraph">{text || ' '}</p>
      return null
    })
    return { nodes, wordCount: totalWords }
  } catch {
    return { nodes: [<p key={0} className="pw-content__paragraph">{content}</p>], wordCount: 0 }
  }
}

function readingMinutes(words: number) {
  return Math.max(1, Math.round(words / 200))
}

function getInitials(name: string | null | undefined): string {
  if (!name) return '?'
  return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function PublicWritingPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [writing, setWriting] = useState<PublicWriting | null>(null)
  const [moreWritings, setMoreWritings] = useState<PublicWriting[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(0)
  const [likeLoading, setLikeLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchPublicWriting(slug)
      .then(w => {
        setWriting(w)
        const authId = loadToken()?.authId
        void fetchLikesInfo(w.id, authId).then(info => {
          setLiked(info.liked)
          setLikesCount(info.count)
        })
        if (w.username) {
          fetchPublicProfile(w.username).then(res => {
            setMoreWritings(res.writings.filter(r => r.slug !== slug).slice(0, 3))
          }).catch(() => {})
        }
      })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      year: 'numeric', month: 'long', day: 'numeric',
    })

  const formatDateShort = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, {
      day: '2-digit', month: 'short', year: 'numeric',
    })

  if (loading) return (
    <div className="pw-root pw-root--center">
      <div className="pw-topbar"><GlobalControls /></div>
      <Loading size="md" label={t('public.loading')} />
    </div>
  )

  if (notFound || !writing) return (
    <div className="pw-root pw-root--center">
      <div className="pw-topbar"><GlobalControls /></div>
      <div className="pw-not-found">
        <p>{t('public.not_found')}</p>
        <Button variant="outline" onClick={() => void navigate('/explore')}>
          {t('public.back_explore')}
        </Button>
      </div>
    </div>
  )

  const authorName = writing.display_name ?? writing.username ?? username ?? '?'
  const { nodes: contentNodes, wordCount } = extractTextAndWords(writing.content)
  const mins = readingMinutes(wordCount)

  function handleLike() {
    if (likeLoading) return
    const authId = loadToken()?.authId
    if (!authId) return
    setLikeLoading(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikesCount(c => c + (wasLiked ? -1 : 1))
    toggleLike(authId, writing!.id, wasLiked)
      .catch(() => {
        setLiked(wasLiked)
        setLikesCount(c => c + (wasLiked ? 1 : -1))
      })
      .finally(() => setLikeLoading(false))
  }

  return (
    <div className="pw-root">
      <header className="pw-topbar">
        <Button
          variant="ghost"
          size="sm"
          className="pw-back-btn"
          onClick={() => void navigate(-1)}
          aria-label={t('common.back')}
        >
          <ArrowLeftIcon />
        </Button>
        <span className="pw-topbar__disclaimer">{t('public.disclaimer')}</span>
        <GlobalControls />
      </header>

      <main className="pw-main">
        <nav className="pw-breadcrumb">
          <Link to="/explore" className="pw-breadcrumb__link">{t('nav.explore')}</Link>
          <span className="pw-breadcrumb__sep" aria-hidden="true">›</span>
          <Link to={`/u/${writing.username ?? username}`} className="pw-breadcrumb__link">
            @{writing.username ?? username}
          </Link>
        </nav>

        <article className="pw-article">
          {writing.category_name && (
            <span className="pw-category">{writing.category_name}</span>
          )}

          <h1 className="pw-title">{writing.title}</h1>

          {/* Author row */}
          <div className="pw-author">
            <Avatar size="sm" fallback={getInitials(authorName)} alt={authorName} />
            <div className="pw-author__info">
              <Link to={`/u/${writing.username ?? username}`} className="pw-author__name">
                {authorName}
              </Link>
              <span className="pw-author__meta">
                @{writing.username ?? username} · {formatDateShort(writing.published_at)}
              </span>
            </div>
            <Button variant="outline" size="sm" className="pw-follow-btn">
              {t('public.follow')}
            </Button>
          </div>

          <div className="pw-content">
            {contentNodes}
          </div>

          {/* Footer stats */}
          <footer className="pw-footer">
            <span className="pw-footer__item">
              <CalendarIcon />
              {formatDate(writing.published_at)}
            </span>
            {wordCount > 0 && (
              <span className="pw-footer__item">
                <EditIcon />
                {wordCount} {t('public.words')} · ~{mins} min {t('public.read')}
              </span>
            )}
          </footer>

          {/* Actions */}
          <div className="pw-actions">
            <Button
              variant="ghost"
              size="sm"
              className={`pw-action-btn${liked ? ' pw-action-btn--active' : ''}`}
              onClick={handleLike}
              disabled={likeLoading}
              aria-pressed={liked}
            >
              <HeartIcon filled={liked} />
              {likesCount > 0 ? likesCount : ''} {t('public.like')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="pw-action-btn"
              onClick={() => { void navigator.share?.({ title: writing.title, url: location.href }) }}
            >
              <ShareIcon />
              {t('public.share')}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={`pw-action-btn${saved ? ' pw-action-btn--active' : ''}`}
              onClick={() => setSaved(v => !v)}
              aria-pressed={saved}
            >
              <BookmarkIcon filled={saved} />
              {t('public.save')}
            </Button>
          </div>
        </article>

        {/* More from author */}
        {moreWritings.length > 0 && (
          <section className="pw-more">
            <h3 className="pw-more__title">
              {t('public.more_from')} {authorName}
            </h3>
            <ul className="pw-more__list">
              {moreWritings.map(w => (
                <li key={w.id}>
                  <Link to={`/u/${w.username ?? username}/${w.slug}`} className="pw-more__card">
                    {w.category_name && (
                      <span className="pw-more__category">{w.category_name}</span>
                    )}
                    <span className="pw-more__card-title">{w.title}</span>
                    {w.excerpt && <span className="pw-more__excerpt">{w.excerpt}</span>}
                  </Link>
                </li>
              ))}
            </ul>
            <Link to={`/u/${writing.username ?? username}`} className="pw-more__see-all">
              {t('public.see_all_writings')}
            </Link>
          </section>
        )}
      </main>
    </div>
  )
}
