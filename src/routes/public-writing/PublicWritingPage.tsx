import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { Button } from '@awakr/awake-ui/button'
import { fetchPublicWriting, fetchPublicProfile, type PublicWriting } from '@/services/api.service'
import { GlobalControls } from '@/components/ui/GlobalControls'
import './PublicWritingPage.css'

/** Garante que data-theme e data-palette do localStorage estejam aplicados no HTML.
 *  main.tsx já faz isso antes do mount, mas esta página pode ser acessada em nova
 *  aba / contexto onde a lógica do main não foi suficiente. */
function useApplyTheme() {
  useEffect(() => {
    try {
      const t = localStorage.getItem('theme')
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      document.documentElement.setAttribute('data-theme', t ?? (prefersDark ? 'dark' : 'light'))
      const p = localStorage.getItem('palette') ?? 'modern'
      document.documentElement.setAttribute('data-palette', p)
    } catch { /* ignore */ }
  }, [])
}

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
      if (node.type === 'paragraph') return <p key={i} className="pw-content__paragraph">{text || '\u00a0'}</p>
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
  useApplyTheme()
  const [writing, setWriting] = useState<PublicWriting | null>(null)
  const [moreWritings, setMoreWritings] = useState<PublicWriting[]>([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchPublicWriting(slug)
      .then(w => {
        setWriting(w)
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

  return (
    <div className="pw-root">
      <header className="pw-topbar">
        <button className="pw-back-btn" onClick={() => void navigate(-1)} aria-label={t('common.back')}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
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
            <div className="pw-author__avatar" aria-hidden="true">
              {getInitials(authorName)}
            </div>
            <div className="pw-author__info">
              <Link to={`/u/${writing.username ?? username}`} className="pw-author__name">
                {authorName}
              </Link>
              <span className="pw-author__meta">
                @{writing.username ?? username} · {formatDateShort(writing.published_at)}
              </span>
            </div>
            <button className="pw-follow-btn">{t('public.follow')}</button>
          </div>

          <div className="pw-content">
            {contentNodes}
          </div>

          {/* Footer stats */}
          <footer className="pw-footer">
            <span className="pw-footer__item">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              {formatDate(writing.published_at)}
            </span>
            {wordCount > 0 && (
              <span className="pw-footer__item">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                {wordCount} {t('public.words')} · ~{mins} min {t('public.read')}
              </span>
            )}
          </footer>

          {/* Actions */}
          <div className="pw-actions">
            <button
              className={`pw-action-btn${liked ? ' pw-action-btn--active' : ''}`}
              onClick={() => setLiked(v => !v)}
              aria-pressed={liked}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={liked ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              {t('public.like')}
            </button>
            <button
              className="pw-action-btn"
              onClick={() => { void navigator.share?.({ title: writing.title, url: location.href }) }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
              {t('public.share')}
            </button>
            <button
              className={`pw-action-btn${saved ? ' pw-action-btn--active' : ''}`}
              onClick={() => setSaved(v => !v)}
              aria-pressed={saved}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
              {t('public.save')}
            </button>
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
