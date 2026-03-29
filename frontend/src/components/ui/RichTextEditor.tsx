import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Mention from "@tiptap/extension-mention";
import { useEffect, useRef, useState } from "react";
import type { ProjectMember } from "../../types";

type Props = {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
  members?: ProjectMember[];
};

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
      StarterKit,
      Placeholder.configure({ placeholder }),
      Mention.configure({
        HTMLAttributes: { class: "mention" },
        suggestion: {
          items: ({ query }) => {
            return members.filter(
              (m) =>
                m.user.name.toLowerCase().includes(query.toLowerCase()) ||
                m.user.username.toLowerCase().includes(query.toLowerCase()),
            );
          },
          render: () => {
            return {
              onStart: (props) => {
                setSuggestionList(props.items as ProjectMember[]);
                setShowSuggestions(true);
                setSelectedIndex(0);
                commandRef.current = (item: ProjectMember) => {
                  props.command({ id: item.user.id, label: item.user.name });
                };
              },
              onUpdate: (props) => {
                setSuggestionList(props.items as ProjectMember[]);
                setSelectedIndex(0);
                commandRef.current = (item: ProjectMember) => {
                  props.command({ id: item.user.id, label: item.user.name });
                };
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
            };
          },
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
  });

  // Sync external content changes (e.g. when task changes)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border bg-surface-2 rounded-t-lg">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          className={`btn-icon text-[11px] font-bold w-6 h-6 ${editor?.isActive("bold") ? "bg-primary/20 text-primary" : ""}`}
        >
          B
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleItalic().run()}
          className={`btn-icon text-[11px] italic w-6 h-6 ${editor?.isActive("italic") ? "bg-primary/20 text-primary" : ""}`}
        >
          I
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBulletList().run()}
          className={`btn-icon text-[11px] w-6 h-6 ${editor?.isActive("bulletList") ? "bg-primary/20 text-primary" : ""}`}
        >
          •—
        </button>
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleCode().run()}
          className={`btn-icon text-[11px] font-mono w-6 h-6 ${editor?.isActive("code") ? "bg-primary/20 text-primary" : ""}`}
        >
          {"<>"}
        </button>
        <span className="text-[10px] text-ink-ghost ml-auto">
          Type @ to mention
        </span>
      </div>

      {/* Editor */}
      <EditorContent
        editor={editor}
        className="rich-editor rounded-b-lg min-h-25 px-3 py-2 text-[13px]"
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
