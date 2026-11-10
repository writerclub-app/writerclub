import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Loading } from '@awakr/awake-ui/loading'
import { fetchPublicWriting, type PublicWriting } from '@/services/api.service'
import { Button } from '@awakr/awake-ui/button'
import { GlobalControls } from '@/components/ui/GlobalControls'
import './PublicWritingPage.css'

export function PublicWritingPage() {
  const { username, slug } = useParams<{ username: string; slug: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [writing, setWriting] = useState<PublicWriting | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    if (!slug) return
    fetchPublicWriting(slug)
      .then(setWriting)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(undefined, {
      year: 'numeric', month: 'long', day: 'numeric',
    })

  const renderContent = (content: string) => {
    try {
      // TipTap JSON → texto simples por blocos
      const doc = JSON.parse(content) as {
        content?: Array<{ type: string; content?: Array<{ text?: string }> }>
      }
      return (doc.content ?? []).map((node, i) => {
        const text = (node.content ?? []).map(n => n.text ?? '').join('')
        if (node.type === 'heading') return <h2 key={i} className="pw-content__heading">{text}</h2>
        if (node.type === 'paragraph') return <p key={i} className="pw-content__paragraph">{text || ' '}</p>
        return null
      })
    } catch {
      return <p className="pw-content__paragraph">{content}</p>
    }
  }

  if (loading) return (
    <div className="pw-root pw-root--center">
      <GlobalControls />
      <Loading size="md" label={t('public.loading')} />
    </div>
  )

  if (notFound || !writing) return (
    <div className="pw-root pw-root--center">
      <GlobalControls />
      <div className="pw-not-found">
        <p>{t('public.not_found')}</p>
        <Button variant="outline" onClick={() => void navigate('/explore')}>
          {t('public.back_explore')}
        </Button>
      </div>
    </div>
  )

  return (
    <div className="pw-root">
      <GlobalControls />

      <main className="pw-main">
        <nav className="pw-breadcrumb">
          <Link to="/explore" className="pw-breadcrumb__link">{t('nav.explore')}</Link>
          <span className="pw-breadcrumb__sep" aria-hidden="true">›</span>
          <Link to={`/u/${username}`} className="pw-breadcrumb__link">
            {writing.display_name ?? writing.username ?? username}
          </Link>
        </nav>

        <article className="pw-article">
          {writing.category_name && (
            <span className="pw-category">{writing.category_name}</span>
          )}

          <h1 className="pw-title">{writing.title}</h1>

          <div className="pw-byline">
            <Link to={`/u/${username}`} className="pw-byline__author">
              {writing.display_name ?? writing.username ?? username}
            </Link>
            <span className="pw-byline__date">{formatDate(writing.published_at)}</span>
          </div>

          <div className="pw-content">
            {renderContent(writing.content)}
          </div>
        </article>
      </main>
    </div>
  )
}
