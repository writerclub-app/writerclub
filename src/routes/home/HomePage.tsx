import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TabsRoot, TabsList, TabsTab, TabsPanel } from '@/components/ui/Tabs'
import { WritingCard } from '@/components/writings/WritingCard'
import { WritingCardSkeleton } from '@/components/writings/WritingCardSkeleton'
import { FolderCard } from '@/components/writings/FolderCard'
import { FolderCardSkeleton } from '@/components/writings/FolderCardSkeleton'
import { FolderModal } from './FolderModal'
import { deleteFolder } from '@/services/folder.service'
import { deleteWriting } from '@/services/writing.service'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { db } from '@/db'
import type { Writing } from '@/types/writing'
import type { Folder } from '@/types/folder'
import './HomePage.css'

type Filter = 'all' | 'draft' | 'published'

export function HomePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [filter, setFilter] = useState<Filter>('all')
  const [writings, setWritings] = useState<Writing[]>([])
  const [folders, setFolders] = useState<Folder[]>([])
  const [loading, setLoading] = useState(true)

  // FolderModal state
  const [modalOpen, setModalOpen] = useState(false)
  const [editingFolder, setEditingFolder] = useState<Folder | undefined>()
  const [deletingWriting, setDeletingWriting] = useState<Writing | undefined>()
  const [deletingFolder, setDeletingFolder] = useState<Folder | undefined>()

  useEffect(() => {
    void Promise.all([
      db.writings.toArray(),
      db.folders.toArray(),
    ]).then(([w, f]) => {
      setWritings(w)
      setFolders(f)
      setLoading(false)
    })
  }, [])

  const filtered = writings.filter((w) => {
    if (filter === 'draft') return !w.isPublic
    if (filter === 'published') return w.isPublic
    return true
  })

  const writingsCountByFolder = (folderId: string) =>
    writings.filter((w) => w.folderId === folderId).length

  const filters: { value: Filter; label: string }[] = [
    { value: 'all',       label: t('home.filter_all') },
    { value: 'draft',     label: t('home.filter_draft') },
    { value: 'published', label: t('home.filter_published') },
  ]

  function openCreateModal() {
    setEditingFolder(undefined)
    setModalOpen(true)
  }

  function openEditModal(folder: Folder) {
    setEditingFolder(folder)
    setModalOpen(true)
  }

  function handleFolderSaved(saved: Folder) {
    setFolders((prev) => {
      const idx = prev.findIndex((f) => f.id === saved.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = saved
        return next
      }
      return [saved, ...prev]
    })
  }

  async function confirmDeleteFolder() {
    if (!deletingFolder) return
    await deleteFolder(deletingFolder.id)
    setFolders((prev) => prev.filter((f) => f.id !== deletingFolder.id))
    setWritings((prev) => prev.map((w) =>
      w.folderId === deletingFolder.id ? { ...w, folderId: undefined } : w
    ))
    setDeletingFolder(undefined)
  }

  async function confirmDeleteWriting() {
    if (!deletingWriting) return
    await deleteWriting(deletingWriting.id)
    setWritings((prev) => prev.filter((w) => w.id !== deletingWriting.id))
    setDeletingWriting(undefined)
  }

  return (
    <div className="home-root">
      <TabsRoot defaultValue="writings" className="home-tabs">
        <TabsList>
          <TabsTab value="writings">{t('home.tab_writings')}</TabsTab>
          <TabsTab value="folders">{t('home.tab_folders')}</TabsTab>
        </TabsList>

        {/* ── Escritos ── */}
        <TabsPanel value="writings" className="home-panel">
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
              {Array.from({ length: 4 }).map((_, i) => <WritingCardSkeleton key={i} />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="home-empty">
              <p className="home-empty__title">{t('home.empty_writings')}</p>
              <p className="home-empty__sub">{t('home.empty_writings_sub')}</p>
            </div>
          ) : (
            <div className="home-list">
              {filtered.map((w) => (
                <WritingCard key={w.id} writing={w} onClick={() => void navigate(`/writings/${w.id}`)} onDelete={() => setDeletingWriting(w)} />
              ))}
            </div>
          )}
        </TabsPanel>

        {/* ── Pastas ── */}
        <TabsPanel value="folders" className="home-panel">
          {loading ? (
            <div className="home-list">
              {Array.from({ length: 3 }).map((_, i) => <FolderCardSkeleton key={i} />)}
            </div>
          ) : folders.length === 0 ? (
            <div className="home-empty">
              <p className="home-empty__title">{t('home.empty_folders')}</p>
              <p className="home-empty__sub">{t('home.empty_folders_sub')}</p>
            </div>
          ) : (
            <div className="home-list">
              {folders.map((folder) => (
                <FolderCard
                  key={folder.id}
                  folder={folder}
                  writingsCount={writingsCountByFolder(folder.id)}
                  onClick={() => void navigate(`/folders/${folder.id}`)}
                  onRename={() => openEditModal(folder)}
                  onDelete={() => setDeletingFolder(folder)}
                />
              ))}
            </div>
          )}

          {/* FAB — nova pasta */}
          <button className="home-fab" onClick={openCreateModal} aria-label={t('folder.create_title')}>
            <span className="home-fab__icon" aria-hidden>+</span>
            <span className="home-fab__label">{t('folder.create_title')}</span>
          </button>
        </TabsPanel>
      </TabsRoot>

      {/* Confirm delete writing */}
      <ConfirmDialog
        open={!!deletingWriting}
        title={t('writing.confirm_delete', { title: deletingWriting?.title ?? '' })}
        description={t('common.cannot_undo')}
        onConfirm={() => void confirmDeleteWriting()}
        onCancel={() => setDeletingWriting(undefined)}
      />

      {/* Confirm delete folder */}
      <ConfirmDialog
        open={!!deletingFolder}
        title={t('folder.confirm_delete', { name: deletingFolder?.name ?? '' })}
        description={t('common.cannot_undo')}
        onConfirm={() => void confirmDeleteFolder()}
        onCancel={() => setDeletingFolder(undefined)}
      />

      {/* Modal criar / renomear */}
      {modalOpen && (
        <FolderModal
          folder={editingFolder}
          onClose={() => setModalOpen(false)}
          onSaved={handleFolderSaved}
        />
      )}
    </div>
  )
}
