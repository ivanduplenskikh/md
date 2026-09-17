import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { QuickOpen } from "./components/QuickOpen";
import { Shortcuts } from "./components/Shortcuts";
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
    notes,
    activePath,
    content,
    dirty,
    saving,
    error,
    renameActive,
  } = useStore();
  const [mode, setMode] = useState<ViewMode>("split");
  const [renaming, setRenaming] = useState<string | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [shortcuts, setShortcuts] = useState(false);

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
      }
    };
    window.addEventListener("keydown", onKey, true);
    return () => window.removeEventListener("keydown", onKey, true);
  }, [save, newNote, chooseVault, openFile, openNote, notes]);

  const title = activePath?.replace(/\.md$/i, "") ?? "";

  return (
    <div className="app">
      <Sidebar />
      <main className="main">
        <header className="toolbar">
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
          <span className="status">{saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}</span>
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
        <div className={`panes ${mode}`}>
          {mode !== "preview" && <Editor />}
          {mode !== "edit" && <Preview />}
        </div>
      </main>
      {quickOpen && <QuickOpen onClose={() => setQuickOpen(false)} />}
      {shortcuts && <Shortcuts onClose={() => setShortcuts(false)} />}
    </div>
  );
}

export default App;
