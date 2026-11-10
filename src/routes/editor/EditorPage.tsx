import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import TextAlign from '@tiptap/extension-text-align'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { Button } from '@awakr/awake-ui/button'
import { Badge } from '@awakr/awake-ui/badge'
import { Dialog } from '@awakr/awake-ui/dialog'
import { Card } from '@awakr/awake-ui/card'
import { Loading } from '@awakr/awake-ui/loading'
import { EditorToolbar } from '@/components/editor/EditorToolbar'
import { useWritingEditor } from '@/hooks/useWritingEditor'
import { getWriting } from '@/services/writing.service'
import { getCategories } from '@/services/category.service'
import { loadToken } from '@/services/auth.service'
import { useUsername } from '@/contexts/UsernameContext'
import type { Writing } from '@/types/writing'
import type { Category } from '@/types/category'
import './EditorPage.css'

function countWords(text: string): number {
  return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
}

export function EditorPage() {
  const { id } = useParams<{ id?: string }>()
  const { t } = useTranslation()
  const token = loadToken()
  const { hasUsername, openModal } = useUsername()

  const [writing, setWriting] = useState<Writing | undefined>()
  const [categories, setCategories] = useState<Category[]>([])
  const [loaded, setLoaded] = useState(!id)
  const [words, setWords] = useState(0)
  const [chars, setChars] = useState(0)
  const titleRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!token) return
    void getCategories(token.authId).then(setCategories)
    if (id) {
      void getWriting(id).then((w) => { setWriting(w); setLoaded(true) })
    }
  }, [id, token])

  const {
    title, setTitle,
    categoryName, selectCategory,
    isPublic, saveStatus,
    showPublishModal, setShowPublishModal,
    editorRef,
    save, publish, unpublish, goBack,
  } = useWritingEditor({ writing })

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder: t('editor.placeholder') }),
      CharacterCount,
    ],
    content: writing?.content ? (JSON.parse(writing.content) as object) : undefined,
    onCreate({ editor: e }) {
      setWords(countWords(e.getText()))
      setChars(e.getText().replace(/\n/g, '').length)
    },
    onUpdate({ editor: e }) {
      setWords(countWords(e.getText()))
      setChars(e.getText().replace(/\n/g, '').length)
    },
    editorProps: {
      attributes: { class: 'editor-content' },
    },
  }, [loaded])

  // Sync ref only — no setState here to avoid cascading renders
  useEffect(() => {
    if (editor) {
      editorRef.current = editor
    }
  }, [editor, editorRef])

  // Auto-resize title textarea
  useEffect(() => {
    const el = titleRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [title])

  const today = new Date().toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', year: 'numeric' })

  return (
    <div className="editor-page">
      {/* Topbar */}
      <header className="editor-topbar">
        <div className="editor-topbar__left">
          <Button variant="ghost" size="sm" className="editor-btn-back" onClick={goBack} aria-label={t('editor.back')}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
          </Button>

          {categories.length > 0 && (
            <div className="editor-type-picker" role="group">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  className={`editor-type-btn${categoryName === cat.name ? ' editor-type-btn--active' : ''}`}
                  onClick={() => selectCategory(cat.id, cat.name)}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="editor-topbar__right">
          {(isPublic || saveStatus === 'saved') && (
            <Badge
              variant={isPublic ? 'info' : 'default'}
              className="editor-status-chip"
            >
              {isPublic ? t('editor.status_published') : t('editor.status_draft')}
            </Badge>
          )}

          {isPublic && (
            <Button variant="outline" size="sm" className="editor-btn-unpublish" onClick={() => void unpublish()}>
              {t('editor.unpublish')}
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            className={`editor-btn-save${saveStatus === 'saved' ? ' editor-btn-save--saved' : ''}`}
            onClick={() => void save()}
            disabled={saveStatus === 'saving'}
          >
            {saveStatus === 'saving'
              ? <Loading size="sm" label={t('editor.saving')} />
              : saveStatus === 'saved'
                ? `✓ ${t('editor.saved')}`
                : t('editor.save')}
          </Button>

          {!isPublic && (
            <Button variant="primary" size="sm" className="editor-btn-publish" onClick={() => { if (!hasUsername) { openModal(); return } setShowPublishModal(true) }}>
              {t('editor.publish')}
            </Button>
          )}
        </div>
      </header>

      {editor && <EditorToolbar editor={editor} />}

      <div className="editor-wrap">
        <textarea
          ref={titleRef}
          className="editor-title"
          rows={1}
          placeholder={t('editor.title_placeholder')}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />

        <div className="editor-meta">
          <span className="editor-meta__date">{today}</span>
          <span className="editor-meta__dot" />
          <span className="editor-meta__words">
            {words === 0
              ? t('editor.no_words')
              : `${t('editor.word_count', { count: words })} · ${t('editor.char_count', { count: chars })}`}
          </span>
        </div>

        <EditorContent editor={editor} className="editor-body" />
      </div>

      {/* Publish modal using Dialog from awake-ui */}
      <Dialog.Root open={showPublishModal} onOpenChange={setShowPublishModal}>
        <Dialog.Portal>
          <Dialog.Backdrop className="editor-modal-backdrop" />
          <Dialog.Popup className="editor-modal">
            <div className="editor-modal__drag" />
            <div className="editor-modal__emoji">🌍</div>
            <Dialog.Title className="editor-modal__title">
              {t('editor.modal_publish_title')}
            </Dialog.Title>
            <p className="editor-modal__sub">{t('editor.modal_publish_sub')}</p>

            <Card.Root className="editor-modal__preview">
              <Card.Content className="editor-modal__preview-content">
                <div className="editor-modal__preview-title">{title || t('editor.untitled')}</div>
                <div className="editor-modal__preview-meta">{categoryName} · {words} {t('editor.words')}</div>
              </Card.Content>
            </Card.Root>

            <div className="editor-modal__actions">
              <Dialog.Close
                render={
                  <Button variant="primary" className="editor-modal__btn-confirm" onClick={() => void publish()} />
                }
              >
                {t('editor.modal_publish_confirm')}
              </Dialog.Close>
              <Dialog.Close
                render={
                  <Button variant="ghost" className="editor-modal__btn-cancel" />
                }
              >
                {t('editor.modal_cancel')}
              </Dialog.Close>
            </div>
          </Dialog.Popup>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  )
}
