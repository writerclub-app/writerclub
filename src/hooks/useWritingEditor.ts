import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Editor } from '@tiptap/react'
import { useToast } from '@awakr/awake-ui/toast'
import { loadToken } from '@/services/auth.service'
import { createWriting, updateWriting } from '@/services/writing.service'
import { upsertWritingToAPI, unpublishWritingFromAPI } from '@/services/api.service'
import type { Writing } from '@/types/writing'
import { classifyWarnings, type ContentWarningTag } from '@/services/ai.service'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseWritingEditorOptions {
  writing?: Writing
}

export function useWritingEditor({ writing }: UseWritingEditorOptions = {}) {
  const navigate = useNavigate()
  const { t } = useTranslation()
  const { toast } = useToast()
  const token = loadToken()

  const [title, setTitle] = useState(writing?.title ?? '')
  const [categoryId, setCategoryId] = useState(writing?.categoryId ?? '')
  const [categoryName, setCategoryName] = useState(writing?.categoryName ?? '')
  const [folderId, setFolderId] = useState<string | undefined>(writing?.folderId)
  const [isPublic, setIsPublic] = useState(writing?.isPublic ?? false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [showSaveModal, setShowSaveModal] = useState(false)
  const [pendingTags, setPendingTags] = useState<ContentWarningTag[]>([])
  const [pendingPublic, setPendingPublic] = useState(false)
  const [writingId, setWritingId] = useState<string | null>(writing?.id ?? null)

  const editorRef = useRef<Editor | null>(null)

  // Sync state when writing loads async (edit mode) — dep on id only to avoid object churn
  useEffect(() => {
    if (!writing) return
    setTitle(writing.title ?? '')
    setCategoryId(writing.categoryId ?? '')
    setCategoryName(writing.categoryName ?? '')
    setFolderId(writing.folderId)
    setIsPublic(writing.isPublic ?? false)
    setWritingId(writing.id ?? null)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [writing?.id])

  const getContent = useCallback(() => {
    if (!editorRef.current) return ''
    return JSON.stringify(editorRef.current.getJSON())
  }, [])

  const wordCount = useCallback(() => {
    if (!editorRef.current) return 0
    const text = editorRef.current.getText()
    return text.trim() === '' ? 0 : text.trim().split(/\s+/).length
  }, [])

  const save = useCallback(async (overridePublic?: boolean, warnings?: ContentWarningTag[]) => {
    if (!token) return
    setSaveStatus('saving')

    const content = getContent()
    const pub = overridePublic ?? isPublic

    try {
      if (writingId) {
        await updateWriting(writingId, { title, content, categoryId, categoryName, folderId, isPublic: pub, ...(warnings !== undefined ? { contentWarnings: warnings } : {}) })
      } else {
        const created = await createWriting({
          title: title || 'Sem título',
          content,
          categoryId,
          categoryName,
          isPublic: pub,
          folderId,
          authorId: token.authId,
          contentWarnings: warnings ?? [],
        })
        setWritingId(created.id)
      }
      setSaveStatus('saved')
      if (pub) setIsPublic(true)
      // Sincroniza com D1
      const slug = (title || 'sem-titulo')
        .toLowerCase()
        .normalize('NFD').replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
      const currentId = writingId
      const excerpt = editorRef.current?.getText().slice(0, 200) ?? ''
      void upsertWritingToAPI(token.authId, {
        localId: currentId ?? '',
        title: title || 'Sem título',
        slug: `${slug}-${currentId?.slice(0, 8) ?? Date.now()}`,
        content: getContent(),
        excerpt,
        categoryName,
        isPublic: pub,
        contentWarnings: warnings ?? [],
      }).catch(() => { /* silent */ })
      setSaveStatus('idle')
      void navigate('/')
    } catch {
      setSaveStatus('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, title, categoryId, categoryName, folderId, isPublic, writingId, getContent, t, toast])

  // Fluxo unificado: classifica → abre modal → salva (se não cancelar)
  const triggerSave = useCallback(async (asPublic: boolean) => {
    setShowPublishModal(false)
    if (!token) return
    setSaveStatus('saving')
    const apiToken = sessionStorage.getItem('wc_api_token') ?? token.accessToken
    const text = editorRef.current?.getText() ?? ''
    const tags = await classifyWarnings(text, apiToken).catch(() => [] as ContentWarningTag[])
    setPendingTags(tags)
    setPendingPublic(asPublic)
    setShowSaveModal(true)
  }, [token, editorRef])

  const publish = useCallback(() => triggerSave(true), [triggerSave])

  const confirmSave = useCallback(async (tags: ContentWarningTag[]) => {
    setShowSaveModal(false)
    await save(pendingPublic, tags)
  }, [save, pendingPublic])

  const cancelSave = useCallback(() => {
    setShowSaveModal(false)
    setSaveStatus('idle')
  }, [])

  const unpublish = useCallback(async () => {
    setIsPublic(false)
    if (writingId && token) {
      void unpublishWritingFromAPI(token.authId, writingId).catch(() => { /* silent */ })
    }
    await save(false)
  }, [save, writingId, token])

  const goBack = useCallback(() => {
    void navigate('/')
  }, [navigate])

  const selectFolder = useCallback((id: string | undefined) => {
    setFolderId(id)
  }, [])

  const selectCategory = useCallback((id: string, name: string) => {
    setCategoryId(id)
    setCategoryName(name)
  }, [])

  return {
    title, setTitle,
    categoryId, categoryName, selectCategory,
    folderId, selectFolder,
    isPublic,
    saveStatus,
    showPublishModal, setShowPublishModal,
    showSaveModal,
    pendingTags,
    pendingPublic,
    confirmSave,
    cancelSave,
    editorRef,
    wordCount,
    save,
    triggerSave,
    publish,
    unpublish,
    goBack,
  }
}
