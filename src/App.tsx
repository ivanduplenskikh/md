import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { Wysiwyg } from "./components/Wysiwyg";
import { Palette, type PaletteItem } from "./components/Palette";
import { Shortcuts } from "./components/Shortcuts";
import { Tabs } from "./components/Tabs";
import { TitleBar } from "./components/TitleBar";
import { StatusBar } from "./components/StatusBar";
import { EditIcon, PreviewIcon, SidebarIcon, SplitIcon, ZenIcon } from "./components/icons";
import { useStore } from "./store";
import { confirmDelete } from "./lib/confirm";
import { stripExtension } from "./lib/paths";
import "./App.css";

type ViewMode = "edit" | "split" | "preview" | "zen";

const MODES = [
  { id: "edit", label: "Editor only", Icon: EditIcon },
  { id: "split", label: "Split", Icon: SplitIcon },
  { id: "preview", label: "Preview only", Icon: PreviewIcon },
  { id: "zen", label: "Write (WYSIWYG)", Icon: ZenIcon },
] as const satisfies readonly { id: ViewMode; label: string; Icon: () => React.ReactElement }[];

function App() {
  const {
    init,
    save,
    newNote,
    chooseVault,
    openFile,
    openNote,
    closeTab,
    deleteNote,
    notes,
    activePath,
    content,
    error,
    renameActive,
    quickOpen,
    setQuickOpen,
    commandOpen,
    setCommandOpen,
  } = useStore();
  const [mode, setMode] = useState<ViewMode>("split");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [shortcuts, setShortcuts] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(260);
  const [split, setSplit] = useState(0.5);
  const panesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const id = setTimeout(() => void save(), 500);
    return () => clearTimeout(id);
  }, [content, save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setQuickOpen(false);
        setCommandOpen(false);
        setShortcuts(false);
        return;
      }
      if (!e.ctrlKey && !e.metaKey) return;

      // Capture phase, so Monaco's own bindings don't swallow these first.
      const digit = /^[1-9]$/.test(e.key) ? Number(e.key) : null;
      if (digit !== null) {
        const note = notes[digit - 1];
        if (!note) return;
        e.preventDefault();
        void openNote(note.path);
        return;
      }

      switch (e.key.toLowerCase()) {
        case "s":
          e.preventDefault();
          void save();
          break;
        case "n":
          e.preventDefault();
          void newNote();
          break;
        case "o":
          e.preventDefault();
          void openFile();
          break;
        case "p":
          e.preventDefault();
          if (e.shiftKey) setCommandOpen(true);
          else setQuickOpen(true);
          break;
        case "e":
          e.preventDefault();
          setMode((m) => (m === "edit" ? "split" : m === "split" ? "preview" : "edit"));
          break;
        case "/":
          e.preventDefault();
          setShortcuts((s) => !s);
          break;
        case "b":
          e.preventDefault();
          setCollapsed((c) => !c);
          break;
        case "w":
          e.preventDefault();
          if (activePath) void closeTab(activePath);
          break;
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [
    save,
    newNote,
    chooseVault,
    openFile,
    openNote,
    closeTab,
    activePath,
    notes,
    setQuickOpen,
    setCommandOpen,
  ]);

  const commands: PaletteItem[] = [
    { id: "new", label: "New note", hint: "Ctrl+N", run: () => void newNote() },
    { id: "open", label: "Open file…", hint: "Ctrl+O", run: () => void openFile() },
    { id: "folder", label: "Open folder…", run: () => void chooseVault() },
    { id: "goto", label: "Go to note…", hint: "Ctrl+P", run: () => setQuickOpen(true) },
    { id: "save", label: "Save note", hint: "Ctrl+S", run: () => void save() },
    {
      id: "rename",
      label: "Rename note…",
      run: () => setRenaming(activePath ? stripExtension(activePath) : ""),
    },
    {
      id: "delete",
      label: "Delete note",
      run: () => {
        if (activePath)
          void confirmDelete(activePath).then((ok) => {
            if (ok) void deleteNote(activePath);
          });
      },
    },
    {
      id: "close",
      label: "Close tab",
      hint: "Ctrl+W",
      run: () => activePath && void closeTab(activePath),
    },
    { id: "view-edit", label: "View: Editor only", run: () => setMode("edit") },
    { id: "view-split", label: "View: Split", run: () => setMode("split") },
    { id: "view-preview", label: "View: Preview only", run: () => setMode("preview") },
    { id: "view-zen", label: "View: Write (WYSIWYG)", run: () => setMode("zen") },
    { id: "sidebar", label: "Toggle sidebar", hint: "Ctrl+B", run: () => setCollapsed((c) => !c) },
    { id: "shortcuts", label: "Keyboard shortcuts", hint: "Ctrl+/", run: () => setShortcuts(true) },
  ];

  const title = activePath ? stripExtension(activePath) : "";

  function startSidebarDrag(e: React.PointerEvent) {
    e.preventDefault();
    const move = (ev: PointerEvent) => setSidebarWidth(Math.min(Math.max(ev.clientX, 160), 480));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  function startSplitDrag(e: React.PointerEvent) {
    e.preventDefault();
    const rect = panesRef.current?.getBoundingClientRect();
    if (!rect) return;
    const move = (ev: PointerEvent) =>
      setSplit(Math.min(Math.max((ev.clientX - rect.left) / rect.width, 0.2), 0.8));
    const up = () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", up);
    };
    window.addEventListener("pointermove", move);
    window.addEventListener("pointerup", up);
  }

  return (
    <div
      className={`app ${collapsed ? "collapsed" : ""}`}
      style={{ "--sidebar-w": `${sidebarWidth}px` } as React.CSSProperties}
    >
      <TitleBar />
      {!collapsed && <Sidebar />}
      {!collapsed && <div className="resizer vertical" onPointerDown={startSidebarDrag} />}
      <main className="main">
        <Tabs />
        <header className="toolbar">
          <button
            className="icon"
            title="Toggle sidebar (Ctrl+B)"
            aria-label="Toggle sidebar"
            onClick={() => setCollapsed((c) => !c)}
          >
            <SidebarIcon />
          </button>
          {renaming === null ? (
            <button
              className="title"
              disabled={!activePath}
              onDoubleClick={() => setRenaming(title)}
              title="Double-click to rename"
            >
              {title || "No note open"}
            </button>
          ) : (
            <input
              className="title-input"
              autoFocus
              value={renaming}
              onChange={(e) => setRenaming(e.target.value)}
              onBlur={() => setRenaming(null)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  void renameActive(renaming);
                  setRenaming(null);
                } else if (e.key === "Escape") {
                  setRenaming(null);
                }
              }}
            />
          )}
          <div className="modes">
            <div className="segmented">
              {MODES.map(({ id, label, Icon }) => (
                <button
                  key={id}
                  className={mode === id ? "active" : ""}
                  onClick={() => setMode(id)}
                  title={`${label} (Ctrl+E cycles)`}
                  aria-label={label}
                  aria-pressed={mode === id}
                >
                  <Icon />
                </button>
              ))}
            </div>
            <button
              className="icon"
              title="Keyboard shortcuts (Ctrl+/)"
              aria-label="Keyboard shortcuts"
              onClick={() => setShortcuts(true)}
            >
              ?
            </button>
          </div>
        </header>
        {error && <div className="error">{error}</div>}
        <div
          className={`panes ${mode}`}
          ref={panesRef}
          style={
            mode === "split"
              ? ({ gridTemplateColumns: `${split}fr 5px ${1 - split}fr` } as React.CSSProperties)
              : undefined
          }
        >
          {mode !== "preview" && mode !== "zen" && <Editor />}
          {mode === "zen" && <Wysiwyg key={activePath} />}
          {mode === "split" && <div className="resizer vertical" onPointerDown={startSplitDrag} />}
          {mode !== "edit" && mode !== "zen" && <Preview />}
        </div>
      </main>
      <StatusBar />
      {quickOpen && (
        <Palette
          items={notes.map((note) => ({
            id: note.path,
            label: stripExtension(note.path),
            run: () => void openNote(note.path),
          }))}
          placeholder="Go to note…"
          emptyLabel="No matching notes"
          onClose={() => setQuickOpen(false)}
        />
      )}
      {commandOpen && (
        <Palette
          items={commands}
          placeholder="Type a command…"
          emptyLabel="No matching commands"
          onClose={() => setCommandOpen(false)}
        />
      )}
      {shortcuts && <Shortcuts onClose={() => setShortcuts(false)} />}
    </div>
  );
}

export default App;
