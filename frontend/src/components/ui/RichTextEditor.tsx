import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useRef, useState } from "react";
import type { ProjectMember } from "../../types";
import {
  Bold,
  Italic,
  List,
  Code,
  Code2,
  Strikethrough,
  Undo,
  Redo,
} from "lucide-react";

const lowlight = createLowlight(common);

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  members?: ProjectMember[];
};

type ToolbarButtonProps = {
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip: string;
  shortcut?: string;
  children: React.ReactNode;
};

function ToolbarButton({
  onClick,
  active,
  disabled,
  tooltip,
  shortcut,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={shortcut ? `${tooltip} (${shortcut})` : tooltip}
      className={`btn-icon w-6 h-6 text-[11px] transition-colors
        ${active ? "bg-primary/20 text-primary" : ""}
        ${disabled ? "opacity-30 cursor-not-allowed" : ""}
      `}
    >
      {children}
    </button>
  );
}

export default function RichTextEditor({
  content,
  onChange,
  placeholder = "Add a description...",
  members = [],
}: Props) {
  const [suggestionList, setSuggestionList] = useState<ProjectMember[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const commandRef = useRef<((item: ProjectMember) => void) | null>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Disable built-in code block — we use CodeBlockLowlight instead
        codeBlock: false,
      }),
      Placeholder.configure({ placeholder }),
      CodeBlockLowlight.configure({ lowlight }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          items: ({ query }) =>
            members.filter(
              (m) =>
                m.user.name.toLowerCase().includes(query.toLowerCase()) ||
                m.user.username.toLowerCase().includes(query.toLowerCase()),
            ),
          render: () => ({
            onStart: (props) => {
              setSuggestionList(props.items as ProjectMember[]);
              setShowSuggestions(true);
              setSelectedIndex(0);
              commandRef.current = (item: ProjectMember) =>
                props.command({ id: item.user.id, label: item.user.name });
            },
            onUpdate: (props) => {
              setSuggestionList(props.items as ProjectMember[]);
              setSelectedIndex(0);
              commandRef.current = (item: ProjectMember) =>
                props.command({ id: item.user.id, label: item.user.name });
            },
            onKeyDown: (props) => {
              if (props.event.key === "ArrowDown") {
                setSelectedIndex((i) =>
                  i < suggestionList.length - 1 ? i + 1 : i,
                );
                return true;
              }
              if (props.event.key === "ArrowUp") {
                setSelectedIndex((i) => (i > 0 ? i - 1 : 0));
                return true;
              }
              if (props.event.key === "Enter") {
                const item = suggestionList[selectedIndex];
                if (item && commandRef.current) commandRef.current(item);
                setShowSuggestions(false);
                return true;
              }
              if (props.event.key === "Escape") {
                setShowSuggestions(false);
                return true;
              }
              return false;
            },
            onExit: () => setShowSuggestions(false),
          }),
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Sync external content changes (e.g. when task changes)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="relative rounded-lg border border-border overflow-hidden focus-within:border-primary/50 transition-colors">
      {/* Toolbar */}
      <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border bg-surface-2">
        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBold().run()}
          active={editor?.isActive("bold")}
          tooltip="Bold"
          shortcut="Ctrl+B"
        >
          <Bold size={12} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          active={editor?.isActive("italic")}
          tooltip="Italic"
          shortcut="Ctrl+I"
        >
          <Italic size={12} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleStrike().run()}
          active={editor?.isActive("strike")}
          tooltip="Strikethrough"
          shortcut="Ctrl+Shift+S"
        >
          <Strikethrough size={12} />
        </ToolbarButton>

        <div className="w-px h-4 bg-border mx-1 shrink-0" />

        {/* Blocks */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          active={editor?.isActive("bulletList")}
          tooltip="Bullet list"
          shortcut="Ctrl+Shift+8"
        >
          <List size={12} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCode().run()}
          active={editor?.isActive("code")}
          tooltip="Inline code"
          shortcut="Ctrl+E"
        >
          <Code size={12} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().toggleCodeBlock().run()}
          active={editor?.isActive("codeBlock")}
          tooltip="Code block"
          shortcut="Ctrl+Alt+C"
        >
          <Code2 size={12} />
        </ToolbarButton>

        <div className="w-px h-4 bg-border mx-1 shrink-0" />

        {/* Undo / Redo */}
        <ToolbarButton
          onClick={() => editor?.chain().focus().undo().run()}
          disabled={!editor?.can().undo()}
          tooltip="Undo"
          shortcut="Ctrl+Z"
        >
          <Undo size={12} />
        </ToolbarButton>

        <ToolbarButton
          onClick={() => editor?.chain().focus().redo().run()}
          disabled={!editor?.can().redo()}
          tooltip="Redo"
          shortcut="Ctrl+Shift+Z"
        >
          <Redo size={12} />
        </ToolbarButton>

        <span className="text-[10px] text-ink-ghost ml-auto">@ to mention</span>
      </div>

      {/* Editor content */}
      <EditorContent
        editor={editor}
        className="rich-editor min-h-25 px-3 py-2 text-[13px]"
      />

      {/* Mention suggestions dropdown */}
      {showSuggestions && suggestionList.length > 0 && (
        <div className="absolute z-50 mt-1 w-48 rounded-lg border border-border bg-surface shadow-lg overflow-hidden">
          {suggestionList.map((m, i) => (
            <button
              key={m.user.id}
              type="button"
              className={`w-full flex items-center gap-2 px-3 py-2 text-left text-[12px] hover:bg-surface-2 transition-colors ${
                i === selectedIndex ? "bg-surface-2" : ""
              }`}
              onClick={() => {
                if (commandRef.current) commandRef.current(m);
                setShowSuggestions(false);
              }}
            >
              <img
                src={m.user.avatar}
                alt={m.user.name}
                width={20}
                height={20}
                referrerPolicy="no-referrer"
                className="avatar w-5 h-5 shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-ink font-medium truncate">
                  {m.user.name}
                </span>
                <span className="text-ink-ghost truncate">
                  @{m.user.username}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
