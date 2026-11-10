import { useState, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import type { Editor } from '@tiptap/react'
import { loadToken } from '@/services/auth.service'
import { createWriting, updateWriting } from '@/services/writing.service'
import type { Writing } from '@/types/writing'

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

interface UseWritingEditorOptions {
  writing?: Writing
}

export function useWritingEditor({ writing }: UseWritingEditorOptions = {}) {
  const navigate = useNavigate()
  const token = loadToken()

  const [title, setTitle] = useState(writing?.title ?? '')
  const [categoryId, setCategoryId] = useState(writing?.categoryId ?? '')
  const [categoryName, setCategoryName] = useState(writing?.categoryName ?? '')
  const [isPublic, setIsPublic] = useState(writing?.isPublic ?? false)
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle')
  const [showPublishModal, setShowPublishModal] = useState(false)
  const [writingId, setWritingId] = useState<string | null>(writing?.id ?? null)

  const editorRef = useRef<Editor | null>(null)

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
        await updateWriting(writingId, { title, content, categoryId, categoryName, isPublic: pub })
      } else {
        const created = await createWriting({
          title: title || 'Sem título',
          content,
          categoryId,
          categoryName,
          isPublic: pub,
          authorId: token.authId,
        })
        setWritingId(created.id)
      }
      setSaveStatus('saved')
      if (pub && overridePublic) setIsPublic(true)
      setTimeout(() => setSaveStatus('idle'), 2000)
    } catch {
      setSaveStatus('error')
    }
  }, [token, title, categoryId, categoryName, isPublic, writingId, getContent])

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

  const selectCategory = useCallback((id: string, name: string) => {
    setCategoryId(id)
    setCategoryName(name)
  }, [])

  return {
    title, setTitle,
    categoryId, categoryName, selectCategory,
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
