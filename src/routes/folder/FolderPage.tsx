import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Button } from '@awakr/awake-ui/button'
import { WritingCard } from '@/components/writings/WritingCard'
import { WritingCardSkeleton } from '@/components/writings/WritingCardSkeleton'
import { ArrowLeftIcon } from '@/components/ui/icons'
import { getFolderById } from '@/services/folder.service'
import { deleteWriting } from '@/services/writing.service'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { db } from '@/db'
import type { Writing } from '@/types/writing'
import type { Folder } from '@/types/folder'
import './FolderPage.css'

type Filter = 'all' | 'draft' | 'published'

export function FolderPage() {
  const { id } = useParams<{ id: string }>()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [folder, setFolder] = useState<Folder | null>(null)
  const [writings, setWritings] = useState<Writing[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [loading, setLoading] = useState(true)
  const [deletingWriting, setDeletingWriting] = useState<Writing | undefined>()

  useEffect(() => {
    if (!id) return
    void Promise.all([
      getFolderById(id),
      db.writings.where('folderId').equals(id).sortBy('updatedAt'),
    ]).then(([f, w]) => {
      setFolder(f ?? null)
      setWritings(w.reverse()) // mais recentes primeiro
      setLoading(false)
    })
  }, [id])

  const filtered = writings.filter((w) => {
    if (filter === 'draft') return !w.isPublic
    if (filter === 'published') return w.isPublic
    return true
  })

  const filters: { value: Filter; label: string }[] = [
    { value: 'all',       label: t('home.filter_all') },
    { value: 'draft',     label: t('home.filter_draft') },
    { value: 'published', label: t('home.filter_published') },
  ]

  async function confirmDeleteWriting() {
    if (!deletingWriting) return
    await deleteWriting(deletingWriting.id)
    setWritings((prev) => prev.filter((w) => w.id !== deletingWriting.id))
    setDeletingWriting(undefined)
  }

  return (
    <div className="folder-page">
      {/* Topbar */}
      <header className="folder-topbar">
        <div className="folder-topbar__left">
          <Button
            variant="ghost"
            size="sm"
            className="folder-btn-back"
            onClick={() => navigate(-1)}
            aria-label={t('editor.back')}
          >
            <ArrowLeftIcon />
          </Button>
          <span className="folder-topbar__title">
            {loading ? '…' : (folder?.name ?? t('folder.not_found'))}
          </span>
        </div>
        <span className="folder-topbar__count">
          {!loading && t('home.writings_count', { count: writings.length })}
        </span>
      </header>

      {/* Content */}
      <main className="folder-main">
        {/* Filter */}
        <div className="home-filter">
          {filters.map((f) => (
            <button
              key={f.value}
              className={`home-filter__chip${filter === f.value ? ' home-filter__chip--active' : ''}`}
              onClick={() => setFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="home-list">
            {Array.from({ length: 3 }).map((_, i) => <WritingCardSkeleton key={i} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="home-empty">
            <p className="home-empty__title">
              {filter === 'all'
                ? t('folder.empty_title')
                : t('home.empty_writings')}
            </p>
            <p className="home-empty__sub">
              {filter === 'all'
                ? t('folder.empty_sub')
                : t('home.empty_writings_sub')}
            </p>
          </div>
        ) : (
          <div className="home-list">
            {filtered.map((w) => (
              <WritingCard
                key={w.id}
                writing={w}
                onClick={() => void navigate(`/writings/${w.id}`)}
                onDelete={() => setDeletingWriting(w)}
              />
            ))}
          </div>
        )}
      </main>
      <ConfirmDialog
        open={!!deletingWriting}
        title={t('writing.confirm_delete', { title: deletingWriting?.title ?? '' })}
        description={t('common.cannot_undo')}
        onConfirm={() => void confirmDeleteWriting()}
        onCancel={() => setDeletingWriting(undefined)}
      />
    </div>
  )
}
