import { useEffect, useRef } from "react";
import {
  Bold,
  Italic,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Quote,
  Code,
  Link as LinkIcon,
  Image as ImageIcon,
  Undo,
  Redo,
  Minus,
} from "lucide-react";

interface RichEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

const MenuButton = ({
  onClick,
  children,
  title,
}: {
  onClick: () => void;
  children: React.ReactNode;
  title: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    title={title}
    className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
  >
    {children}
  </button>
);

const wrapSelection = (before: string, after = before) => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();
  const fragment = range.createContextualFragment(`${before}${selectedText}${after}`);
  range.deleteContents();
  range.insertNode(fragment);
};

const RichEditor = ({ content, onChange, placeholder = "Escribe aquí..." }: RichEditorProps) => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== content) {
      editorRef.current.innerHTML = content || "";
    }
  }, [content]);

  const focusEditor = () => {
    editorRef.current?.focus();
  };

  const exec = (command: string, value?: string) => {
    focusEditor();
    document.execCommand(command, false, value);
    onChange(editorRef.current?.innerHTML || "");
  };

  const addLink = () => {
    const url = window.prompt("URL del enlace:");
    if (!url) return;
    exec("createLink", url);
  };

  const addImage = () => {
    const url = window.prompt("URL de la imagen:");
    if (!url) return;
    exec("insertImage", url);
  };

  const insertHorizontalRule = () => {
    focusEditor();
    document.execCommand("insertHorizontalRule");
    onChange(editorRef.current?.innerHTML || "");
  };

  const applyHeading = (level: 1 | 2) => {
    exec("formatBlock", `<h${level}>`);
  };

  const handleInput = () => {
    onChange(editorRef.current?.innerHTML || "");
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    event.preventDefault();
    const text = event.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    onChange(editorRef.current?.innerHTML || "");
  };

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex flex-wrap gap-0.5 border-b border-border bg-secondary/30 p-2">
        <MenuButton onClick={() => exec("bold")} title="Negrita">
          <Bold className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("italic")} title="Cursiva">
          <Italic className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("strikeThrough")} title="Tachado">
          <Strikethrough className="h-4 w-4" />
        </MenuButton>
        <div className="mx-1 w-px bg-border" />
        <MenuButton onClick={() => applyHeading(1)} title="Título 1">
          <Heading1 className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => applyHeading(2)} title="Título 2">
          <Heading2 className="h-4 w-4" />
        </MenuButton>
        <div className="mx-1 w-px bg-border" />
        <MenuButton onClick={() => exec("insertUnorderedList")} title="Lista">
          <List className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("insertOrderedList")} title="Lista numerada">
          <ListOrdered className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("formatBlock", "<blockquote>")} title="Cita">
          <Quote className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => wrapSelection("<code>", "</code>")} title="Código">
          <Code className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={insertHorizontalRule} title="Línea horizontal">
          <Minus className="h-4 w-4" />
        </MenuButton>
        <div className="mx-1 w-px bg-border" />
        <MenuButton onClick={addLink} title="Enlace">
          <LinkIcon className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={addImage} title="Imagen">
          <ImageIcon className="h-4 w-4" />
        </MenuButton>
        <div className="mx-1 w-px bg-border" />
        <MenuButton onClick={() => exec("undo")} title="Deshacer">
          <Undo className="h-4 w-4" />
        </MenuButton>
        <MenuButton onClick={() => exec("redo")} title="Rehacer">
          <Redo className="h-4 w-4" />
        </MenuButton>
      </div>
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        data-placeholder={placeholder}
        onInput={handleInput}
        onPaste={handlePaste}
        className="prose prose-sm min-h-[300px] max-w-none p-4 outline-none [&:empty:before]:pointer-events-none [&:empty:before]:float-left [&:empty:before]:text-muted-foreground [&:empty:before]:content-[attr(data-placeholder)]"
      />
    </div>
  );
};

export default RichEditor;
