"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect } from "react";

interface RichEditorProps {
  content: string;
  onChange: (value: string) => void;
  editable?: boolean;
}

export function RichEditor({ content, onChange, editable = true }: RichEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: "Start typing your document content here…" }),
    ],
    content: content || "",
    editable,
    immediatelyRender: false,
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (!editor) return;
    if (editor.getHTML() !== content) {
      editor.commands.setContent(content || "", { emitUpdate: false });
    }
  }, [content, editor]);

  useEffect(() => {
    editor?.setEditable(editable);
  }, [editable, editor]);

  return (
    <div className={`prose prose-sm max-w-none min-h-[300px] ${editable ? "focus-within:outline-none" : "opacity-70"}`}>
      <EditorContent editor={editor} className="outline-none" />
    </div>
  );
}
