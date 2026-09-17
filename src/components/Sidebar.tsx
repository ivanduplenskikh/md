import { useStore } from "../store";

export function Sidebar() {
  const { notes, activePath, vaultPath, openNote, newNote, chooseVault, openFile, deleteNote } =
    useStore();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <button onClick={newNote} disabled={!vaultPath} title="New note (Ctrl+N)">
          + New
        </button>
        <button onClick={openFile} title="Open a .md file (Ctrl+O)">
          Open…
        </button>
        <button onClick={chooseVault} title="Choose vault folder">
          Folder…
        </button>
      </div>
      <div className="vault-path" title={vaultPath ?? ""}>
        {vaultPath ?? "No vault selected"}
      </div>
      <ul className="note-list">
        {notes.map((note) => (
          <li key={note.path} className={note.path === activePath ? "active" : ""}>
            <button className="note-item" onClick={() => openNote(note.path)}>
              {note.path.replace(/\.md$/i, "")}
            </button>
            <button
              className="delete"
              title="Delete note"
              onClick={() => {
                if (confirm(`Delete "${note.name}"?`)) void deleteNote(note.path);
              }}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
