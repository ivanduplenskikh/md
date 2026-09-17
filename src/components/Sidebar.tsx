import { useState } from "react";
import { useStore } from "../store";
import { ContextMenu } from "./ContextMenu";
import { confirmDelete } from "../lib/confirm";
import { popupNativeMenu } from "../lib/nativeMenu";
import { basename, stripExtension } from "../lib/paths";
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

  function actionsFor(path: string, name: string) {
    return [
      { label: "Open", run: () => void openNote(path) },
      { label: "Rename…", run: () => setRenamingPath(path) },
      { label: "New note", run: () => void newNote() },
      {
        label: "Delete",
        danger: true,
        run: () => {
          void confirmDelete(name).then((ok) => {
            if (ok) void deleteNote(path);
          });
        },
      },
    ];
  }

  const folderName = vaultPath ? basename(vaultPath) : "No folder opened";

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
            onContextMenu={async (e) => {
              e.preventDefault();
              const actions = actionsFor(note.path, note.name);
              if (!(await popupNativeMenu(actions))) {
                setMenu({ x: e.clientX, y: e.clientY, path: note.path });
              }
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
                  {stripExtension(note.path)}
                </button>
                <button
                  className="delete"
                  title="Delete note"
                  aria-label={`Delete ${note.name}`}
                  onClick={() => {
                    void confirmDelete(note.name).then((ok) => {
                      if (ok) void deleteNote(note.path);
                    });
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
          items={actionsFor(menu.path, stripExtension(basename(menu.path)))}
        />
      )}
    </aside>
  );
}
