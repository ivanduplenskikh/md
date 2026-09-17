import { useState } from "react";
import { useStore } from "../store";
import { ContextMenu } from "./ContextMenu";
import { FileIcon, FolderIcon, PlusIcon, TrashIcon } from "./icons";

export function Sidebar() {
  const {
    notes,
    activePath,
    vaultPath,
    openNote,
    newNote,
    chooseVault,
    openFile,
    deleteNote,
    renamePath,
  } = useStore();
  const [menu, setMenu] = useState<{ x: number; y: number; path: string } | null>(null);
  const [renamingPath, setRenamingPath] = useState<string | null>(null);

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
          <li
            key={note.path}
            className={note.path === activePath ? "active" : ""}
            onContextMenu={(e) => {
              e.preventDefault();
              setMenu({ x: e.clientX, y: e.clientY, path: note.path });
            }}
          >
            {renamingPath === note.path ? (
              <input
                className="rename-input"
                autoFocus
                defaultValue={note.name}
                onBlur={() => setRenamingPath(null)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    void renamePath(note.path, e.currentTarget.value);
                    setRenamingPath(null);
                  } else if (e.key === "Escape") {
                    setRenamingPath(null);
                  }
                }}
              />
            ) : (
              <>
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
              </>
            )}
          </li>
        ))}
      </ul>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          onClose={() => setMenu(null)}
          items={[
            { label: "Open", run: () => void openNote(menu.path) },
            { label: "Rename…", run: () => setRenamingPath(menu.path) },
            { label: "New note", run: () => void newNote() },
            {
              label: "Delete",
              danger: true,
              run: () => {
                if (confirm(`Delete "${menu.path}"?`)) void deleteNote(menu.path);
              },
            },
          ]}
        />
      )}
    </aside>
  );
}
