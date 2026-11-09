import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { TabsRoot, TabsList, TabsTab, TabsPanel } from '@/components/ui/Tabs'
import { WritingCard } from '@/components/writings/WritingCard'
import { WritingCardSkeleton } from '@/components/writings/WritingCardSkeleton'
import { FolderCard } from '@/components/writings/FolderCard'
import { FolderCardSkeleton } from '@/components/writings/FolderCardSkeleton'
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

  return (
    <div className="home-root">
      <TabsRoot defaultValue="writings" className="home-tabs">
        <TabsList>
          <TabsTab value="writings">{t('home.tab_writings')}</TabsTab>
          <TabsTab value="folders">{t('home.tab_folders')}</TabsTab>
        </TabsList>

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
                <WritingCard key={w.id} writing={w} onClick={() => void navigate(`/writings/${w.id}`)} />
              ))}
            </div>
          )}
        </TabsPanel>

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
                />
              ))}
            </div>
          )}
        </TabsPanel>
      </TabsRoot>
    </div>
  )
}
