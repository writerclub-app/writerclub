import { useEffect, useRef, useState } from 'react'
import type { Editor } from '@tiptap/react'
import { Button } from '@awakr/awake-ui/button'
import './SelectionMenu.css'

interface Props {
  editor: Editor
  onRewrite: () => void
  onRhyme: () => void
}

export function SelectionMenu({ editor, onRewrite, onRhyme }: Props) {
  const [visible, setVisible] = useState(false)
  const [pos, setPos] = useState({ top: 0, left: 0 })
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!editor) return

    const update = () => {
      const { from, to } = editor.state.selection
      if (from === to) { setVisible(false); return }

      const domSelection = window.getSelection()
      if (!domSelection || domSelection.rangeCount === 0) { setVisible(false); return }

      const range = domSelection.getRangeAt(0)
      const rect = range.getBoundingClientRect()
      if (rect.width === 0) { setVisible(false); return }

      const editorEl = editor.view.dom.closest('.editor-wrap') ?? document.body
      const editorRect = editorEl.getBoundingClientRect()

      setPos({
        top: rect.top - editorRect.top - 8,   // 8px above selection
        left: rect.left - editorRect.left + rect.width / 2,
      })
      setVisible(true)
    }

    editor.on('selectionUpdate', update)
    editor.on('blur', () => setVisible(false))

    return () => {
      editor.off('selectionUpdate', update)
    }
  }, [editor])

  if (!visible) return null

  return (
    <div
      ref={menuRef}
      className="selection-menu"
      style={{ top: pos.top, left: pos.left }}
      onMouseDown={(e) => e.preventDefault()}   // keep editor selection
    >
      <Button variant="ghost" size="sm" onClick={() => { setVisible(false); onRewrite() }}>
        ✦ Rewrite
      </Button>
      <div className="selection-menu__sep" />
      <Button variant="ghost" size="sm" onClick={() => { setVisible(false); onRhyme() }}>
        ♪ Rhyme
      </Button>
    </div>
  )
}
