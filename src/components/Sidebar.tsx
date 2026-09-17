import { useStore } from "../store";
import { FileIcon, FolderIcon, PlusIcon, TrashIcon } from "./icons";

export function Sidebar() {
  const { notes, activePath, vaultPath, openNote, newNote, chooseVault, openFile, deleteNote } =
    useStore();

  const folderName = vaultPath?.split(/[\\/]/).filter(Boolean).pop() ?? "No folder opened";

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="vault-name" title={vaultPath ?? ""}>
          {folderName}
        </span>
        <button
          className="icon"
          onClick={newNote}
          disabled={!vaultPath}
          title="New note (Ctrl+N)"
          aria-label="New note"
        >
          <PlusIcon />
        </button>
        <button
          className="icon"
          onClick={openFile}
          title="Open a .md file (Ctrl+O)"
          aria-label="Open file"
        >
          <FileIcon />
        </button>
        <button
          className="icon"
          onClick={chooseVault}
          title="Choose vault folder"
          aria-label="Choose vault folder"
        >
          <FolderIcon />
        </button>
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
              aria-label={`Delete ${note.name}`}
              onClick={() => {
                if (confirm(`Delete "${note.name}"?`)) void deleteNote(note.path);
              }}
            >
              <TrashIcon />
            </button>
          </li>
        ))}
      </ul>
    </aside>
  );
}
