import { useState, useCallback, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import type { Editor } from '@tiptap/react'
import { useToast } from '@awakr/awake-ui/toast'
import { loadToken } from '@/services/auth.service'
import { createWriting, updateWriting } from '@/services/writing.service'
import type { Writing } from '@/types/writing'

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

  const save = useCallback(async (overridePublic?: boolean) => {
    if (!token) return
    setSaveStatus('saving')

    const content = getContent()
    const pub = overridePublic ?? isPublic

    try {
      if (writingId) {
        await updateWriting(writingId, { title, content, categoryId, categoryName, folderId, isPublic: pub })
      } else {
        const created = await createWriting({
          title: title || 'Sem título',
          content,
          categoryId,
          categoryName,
          isPublic: pub,
          folderId,
          authorId: token.authId,
        })
        setWritingId(created.id)
      }
      setSaveStatus('saved')
      if (pub && overridePublic) setIsPublic(true)
      toast({
        message: pub && overridePublic ? t('editor.toast_published') : t('editor.toast_saved'),
        variant: pub && overridePublic ? 'success' : 'info',
      })
      setTimeout(() => { setSaveStatus('idle'); void navigate('/') }, 1200)
    } catch {
      setSaveStatus('error')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, title, categoryId, categoryName, folderId, isPublic, writingId, getContent, t, toast])

  const publish = useCallback(async () => {
    setShowPublishModal(false)
    await save(true)
  }, [save])

  const unpublish = useCallback(async () => {
    setIsPublic(false)
    await save(false)
  }, [save])

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
    editorRef,
    wordCount,
    save,
    publish,
    unpublish,
    goBack,
  }
}
