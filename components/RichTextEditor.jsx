"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";

// ─── Toolbar button ───────────────────────────────────────────────────────────
function ToolbarButton({ onClick, active, disabled, title, children }) {
  return (
    <button
      type="button"
      onMouseDown={(e) => {
        e.preventDefault();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold transition-colors
        ${
          active
            ? "bg-mv-primary/15 text-mv-primary"
            : "text-mv-dim hover:text-mv-text hover:bg-mv-surface"
        } disabled:opacity-30 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
}

// ─── Divider ─────────────────────────────────────────────────────────────────
function Divider() {
  return <div className="w-px h-5 bg-mv-border mx-1 shrink-0" />;
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Write something…",
}) {
  const editor = useEditor({
    immediatelyRender: false,

    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2] },
        codeBlock: { HTMLAttributes: { class: "tiptap-code-block" } },
        blockquote: { HTMLAttributes: { class: "tiptap-blockquote" } },
      }),
      Underline,
    ],
    content,
    editorProps: {
      attributes: {
        class: "tiptap-editor",
      },
    },
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) return null;

  return (
    <div className="border border-mv-border rounded-xl overflow-hidden focus-within:border-mv-primary/50 transition-colors">
      {/* ── Toolbar ── */}
      <div className="flex items-center flex-wrap gap-0.5 px-2 py-1.5 bg-mv-surface-2 border-b border-mv-border">
        {/* Headings */}
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 1 }).run()
          }
          active={editor.isActive("heading", { level: 1 })}
          title="Heading 1"
        >
          H1
        </ToolbarButton>
        <ToolbarButton
          onClick={() =>
            editor.chain().focus().toggleHeading({ level: 2 }).run()
          }
          active={editor.isActive("heading", { level: 2 })}
          title="Heading 2"
        >
          H2
        </ToolbarButton>

        <Divider />

        {/* Bold */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive("bold")}
          title="Bold"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 2h4a2 2 0 010 4H3V2zM3 6h4.5a2.5 2.5 0 010 5H3V6z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
        </ToolbarButton>

        {/* Italic */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive("italic")}
          title="Italic"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M5 2h4M3 10h4M7 2L5 10"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </ToolbarButton>

        {/* Underline */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive("underline")}
          title="Underline"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M3 2v4a3 3 0 006 0V2"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <path
              d="M2 10h8"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Bullet list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive("bulletList")}
          title="Bullet list"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <circle cx="2" cy="3.5" r="1" fill="currentColor" />
            <circle cx="2" cy="6.5" r="1" fill="currentColor" />
            <circle cx="2" cy="9.5" r="1" fill="currentColor" />
            <path
              d="M5 3.5h6M5 6.5h6M5 9.5h6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </ToolbarButton>

        {/* Ordered list */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive("orderedList")}
          title="Numbered list"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 2.5h1.5v3M2 5.5h3"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M5 9.5h6M5 6.5h6"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M2 8c0-.55.45-1 1-1s1 .45 1 1c0 .4-.2.7-.5.9L2 10.5h2"
              stroke="currentColor"
              strokeWidth="1.1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive("blockquote")}
          title="Block quote"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 4.5C2 3.67 2.67 3 3.5 3H5v2H3.5C3.22 5 3 5.22 3 5.5v.5h2v3H2V4.5zM7 4.5C7 3.67 7.67 3 8.5 3H10v2H8.5C8.22 5 8 5.22 8 5.5v.5h2v3H7V4.5z"
              fill="currentColor"
              opacity="0.7"
            />
          </svg>
        </ToolbarButton>

        {/* Code block */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive("codeBlock")}
          title="Code block"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M4 3L1 6.5 4 10M9 3l3 3.5L9 10"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </ToolbarButton>

        <Divider />

        {/* Undo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M2 5h5a3 3 0 010 6H4"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M2 5l2.5-2.5M2 5l2.5 2.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </ToolbarButton>

        {/* Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
            <path
              d="M11 5H6a3 3 0 000 6h3"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
            <path
              d="M11 5L8.5 2.5M11 5L8.5 7.5"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="round"
            />
          </svg>
        </ToolbarButton>
      </div>

      {/* ── Editor area ── */}
      <div className="relative">
        {/* Placeholder */}
        {editor.isEmpty && (
          <p className="absolute top-3 left-4 text-sm text-mv-dim pointer-events-none select-none">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
