import { Tooltip } from '@awakr/awake-ui/tooltip'
import { Separator } from '@awakr/awake-ui/separator'
import type { Editor } from '@tiptap/react'
import {
  AlignLeftIcon, AlignCenterIcon, AlignRightIcon,
  BlockquoteIcon, ClearFormatIcon,
} from '@/components/ui/icons'
import './EditorToolbar.css'

interface Props {
  editor: Editor
}

interface FormatButtonProps {
  onClick: () => void
  active: boolean
  label: string
  children: React.ReactNode
}

function FormatButton({ onClick, active, label, children }: FormatButtonProps) {
  return (
    <Tooltip.Root>
      <Tooltip.Trigger
        render={
          <button
            type="button"
            className={`fmt-btn${active ? ' fmt-btn--active' : ''}`}
            aria-label={label}
            aria-pressed={active}
            onMouseDown={(e) => { e.preventDefault(); onClick() }}
          />
        }
      >
        {children}
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Positioner>
          <Tooltip.Popup>{label}</Tooltip.Popup>
        </Tooltip.Positioner>
      </Tooltip.Portal>
    </Tooltip.Root>
  )
}

export function EditorToolbar({ editor }: Props) {
  return (
    <Tooltip.Provider>
      <div className="format-bar" role="toolbar" aria-label="Formatação">
        <FormatButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          label="Negrito"
        >
          <b>B</b>
        </FormatButton>
        <FormatButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          label="Itálico"
        >
          <i>I</i>
        </FormatButton>
        <FormatButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
          label="Sublinhado"
        >
          <u>U</u>
        </FormatButton>
        <FormatButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          label="Tachado"
        >
          <s>S</s>
        </FormatButton>

        <Separator orientation="vertical" className="fmt-sep" />

        <FormatButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          active={editor.isActive({ textAlign: 'left' })}
          label="Alinhar esquerda"
        >
          <AlignLeftIcon />
        </FormatButton>
        <FormatButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          active={editor.isActive({ textAlign: 'center' })}
          label="Centralizar"
        >
          <AlignCenterIcon />
        </FormatButton>
        <FormatButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          active={editor.isActive({ textAlign: 'right' })}
          label="Alinhar direita"
        >
          <AlignRightIcon />
        </FormatButton>

        <Separator orientation="vertical" className="fmt-sep" />

        <FormatButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          label="Citação"
        >
          <BlockquoteIcon />
        </FormatButton>

        <Separator orientation="vertical" className="fmt-sep" />

        <FormatButton
          onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
          active={false}
          label="Limpar formatação"
        >
          <ClearFormatIcon />
        </FormatButton>
      </div>
    </Tooltip.Provider>
  )
}
