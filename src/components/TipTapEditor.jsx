import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import { useEffect } from 'react'

function TipTapEditor({ content, onChange, placeholder, isReadOnly, compact }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Placeholder.configure({
        placeholder: placeholder || '마크다운으로 메모를 작성하세요...'
      }),
      TaskList,
      TaskItem.configure({
        nested: true
      })
    ],
    content: content || '',
    editable: !isReadOnly,
    onUpdate: ({ editor }) => {
      if (onChange) {
        onChange(editor.getHTML())
      }
    }
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content || '')
    }
  }, [content, editor])

  useEffect(() => {
    if (editor) {
      editor.setEditable(!isReadOnly)
    }
  }, [isReadOnly, editor])

  if (!editor) return null

  return (
    <div className={`tiptap-editor ${compact ? 'tiptap-compact' : ''} ${isReadOnly ? 'tiptap-readonly' : ''}`}>
      <EditorContent editor={editor} />
    </div>
  )
}

export default TipTapEditor
