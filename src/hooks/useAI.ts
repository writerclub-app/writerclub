import { useState, useRef, useCallback } from 'react'
import type { Editor } from '@tiptap/react'
import { streamAI, type AICommand } from '@/services/api.service'
import { loadToken } from '@/services/auth.service'

export type AILanguage = 'pt' | 'en' | 'es' | 'it'

export type AIState =
  | { status: 'idle' }
  | { status: 'lang-select'; command: AICommand }
  | { status: 'loading'; command: AICommand }
  | { status: 'suggestion'; command: AICommand; text: string }
  | { status: 'options'; command: AICommand; options: string[] }
  | { status: 'error'; message: string }

// Commands that require language selection before firing
const LANG_COMMANDS: AICommand[] = ['complete', 'rewrite']

export function useAI(editor: Editor | null) {
  const [state, setState] = useState<AIState>({ status: 'idle' })
  const abortRef = useRef<AbortController | null>(null)

  const cancel = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setState({ status: 'idle' })
  }, [])

  const fire = useCallback((command: AICommand, language?: AILanguage) => {
    const token = loadToken()
    if (!token || !editor) return

    abortRef.current?.abort()

    const context = editor.getText()
    const { from, to } = editor.state.selection
    const selection = from !== to ? editor.state.doc.textBetween(from, to) : undefined

    setState({ status: 'loading', command })

    let accumulated = ''

    abortRef.current = streamAI(
      token.authId,
      { command, context, selection, language },
      (chunk) => {
        accumulated += chunk
        if (command === 'suggest-rhyme') {
          setState({ status: 'loading', command })
        } else {
          setState({ status: 'suggestion', command, text: accumulated })
        }
      },
      () => {
        if (command === 'suggest-rhyme') {
          const options = accumulated
            .split('\n')
            .map((l) => l.trim())
            .filter(Boolean)
            .slice(0, 5)
          setState({ status: 'options', command, options })
        } else {
          setState({ status: 'suggestion', command, text: accumulated })
        }
      },
      (err) => {
        setState({ status: 'error', message: err.message })
      },
    )
  }, [editor])

  const run = useCallback((command: AICommand) => {
    if (LANG_COMMANDS.includes(command)) {
      setState({ status: 'lang-select', command })
    } else {
      fire(command)
    }
  }, [fire])

  const selectLang = useCallback((lang: AILanguage) => {
    if (state.status !== 'lang-select') return
    fire(state.command, lang)
  }, [state, fire])

  const accept = useCallback(() => {
    if (!editor || state.status !== 'suggestion') return

    const { command, text } = state

    if (command === 'complete') {
      editor.chain().focus().insertContent(text).run()
    } else if (command === 'rewrite') {
      const { from, to } = editor.state.selection
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, text).run()
    }

    setState({ status: 'idle' })
  }, [editor, state])

  const pickOption = useCallback((option: string) => {
    if (!editor || state.status !== 'options') return

    const { from, to } = editor.state.selection
    if (from !== to) {
      editor.chain().focus().deleteRange({ from, to }).insertContentAt(from, option).run()
    } else {
      editor.chain().focus().insertContent(` ${option}`).run()
    }

    setState({ status: 'idle' })
  }, [editor, state])

  const dismiss = useCallback(() => {
    setState({ status: 'idle' })
  }, [])

  return { state, run, selectLang, accept, pickOption, dismiss, cancel }
}
