import { useEffect, useState } from "react";
import { Sidebar } from "./components/Sidebar";
import { Editor } from "./components/Editor";
import { Preview } from "./components/Preview";
import { useStore } from "./store";
import "./App.css";

type ViewMode = "edit" | "split" | "preview";

function App() {
  const { init, save, newNote, activePath, content, dirty, saving, error, renameActive } =
    useStore();
  const [mode, setMode] = useState<ViewMode>("split");
  const [renaming, setRenaming] = useState<string | null>(null);

  useEffect(() => {
    void init();
  }, [init]);

  useEffect(() => {
    const id = setTimeout(() => void save(), 500);
    return () => clearTimeout(id);
  }, [content, save]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) return;
      if (e.key === "s") {
        e.preventDefault();
        void save();
      } else if (e.key === "n") {
        e.preventDefault();
        void newNote();
      } else if (e.key === "e") {
        e.preventDefault();
        setMode((m) => (m === "edit" ? "split" : m === "split" ? "preview" : "edit"));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [save, newNote]);

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
          </div>
        </header>
        {error && <div className="error">{error}</div>}
        <div className={`panes ${mode}`}>
          {mode !== "preview" && <Editor />}
          {mode !== "edit" && <Preview />}
        </div>
      </main>
    </div>
  );
}

export default App;
