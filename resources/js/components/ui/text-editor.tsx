import { useEditor, EditorContent, Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import TextStyle from '@tiptap/extension-text-style'
import ListItem from '@tiptap/extension-list-item'
import Color from '@tiptap/extension-color'
import { Button } from '@/components/ui/button'
import clsx from 'clsx'
import Link from '@tiptap/extension-link'
import '@/styles/tiptap.css'
import { ListIcon, ListOrderedIcon, Redo2Icon, RedoIcon, Undo2Icon, UndoIcon } from 'lucide-react'

interface MenuBarProps {
    editor: Editor | null;
}
const MenuBar = ({ editor } : MenuBarProps) => {
  if (!editor) {
    return null
  }

  return (
    <div className="flex space-x-2 border-b pb-2 mb-2">
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={clsx('text-xs', editor.isActive('bold') ? 'bg-gray-300' : '')}
      >
        B
      </Button>
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={clsx('text-xs', editor.isActive('italic') ? 'bg-gray-300' : '')}
      >
        I
      </Button>
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={clsx('text-xs', editor.isActive('strike') ? 'bg-gray-300' : '')}
      >
        S
      </Button>
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={clsx('text-xs', editor.isActive('bulletList') ? 'bg-gray-300' : '')}
      >
        <ListIcon/>
      </Button>
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={clsx('text-xs', editor.isActive('orderedList') ? 'bg-gray-300' : '')}
      >
       <ListOrderedIcon/>
      </Button>
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().undo().run()}
        className={clsx('text-xs', editor.isActive('undo') ? 'bg-gray-300' : '')}
      >
       <Undo2Icon/>
      </Button>
      <Button
        variant={'secondary'}
        type="button"
        onClick={() => editor.chain().focus().redo().run()}
        className={clsx('text-xs', editor.isActive('redo') ? 'bg-gray-300' : '')}
      >
       <Redo2Icon/>
      </Button>
    </div>
  )
}

const extensions = [
  Color.configure({ types: [TextStyle.name, ListItem.name] }),
  TextStyle,
  Link.configure({
    autolink: true,
    openOnClick: true,
    linkOnPaste: true,
    shouldAutoLink: (url) => url.startsWith('https://') || url.startsWith('http://'),
  }),
  StarterKit.configure({
    bulletList: { keepMarks: true, keepAttributes: false },
    orderedList: { keepMarks: true, keepAttributes: false },
  }),
]

type RichTextEditorProps = {
  editor : Editor
};

export default function RichTextEditor({ editor }: RichTextEditorProps) {
  return (
    <div className='w-full h-full'>
      <MenuBar editor={editor} />
      {editor && <EditorContent className='min-h-12' editor={editor} />}
    </div>
  )
}
