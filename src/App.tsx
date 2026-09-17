import { useEffect, useRef, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { QuickOpen } from "./components/QuickOpen";
import { Shortcuts } from "./components/Shortcuts";
import { Tabs } from "./components/Tabs";
import { StatusBar } from "./components/StatusBar";
import { SidebarIcon } from "./components/icons";
import { useStore } from "./store";
import "./App.css";

type ViewMode = "edit" | "split" | "preview";

function App() {
  const {
    init,
    save,
    newNote,
    chooseVault,
    openFile,
    openNote,
    closeTab,
    notes,
    activePath,
    content,
    error,
    renameActive,
    quickOpen,
    setQuickOpen,
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
          setQuickOpen(true);
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
  }, [save, newNote, chooseVault, openFile, openNote, closeTab, activePath, notes, setQuickOpen]);

  const title = activePath?.replace(/\.md$/i, "") ?? "";

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
            {(["edit", "split", "preview"] as ViewMode[]).map((m) => (
              <button key={m} className={mode === m ? "active" : ""} onClick={() => setMode(m)}>
                {m}
              </button>
            ))}
            <button title="Keyboard shortcuts (Ctrl+/)" onClick={() => setShortcuts(true)}>
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
          {mode !== "preview" && <Editor />}
          {mode === "split" && <div className="resizer vertical" onPointerDown={startSplitDrag} />}
          {mode !== "edit" && <Preview />}
        </div>
      </main>
      <StatusBar />
      {quickOpen && <QuickOpen onClose={() => setQuickOpen(false)} />}
      {shortcuts && <Shortcuts onClose={() => setShortcuts(false)} />}
    </div>
  );
}

export default App;
