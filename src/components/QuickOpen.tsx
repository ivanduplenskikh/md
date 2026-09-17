import { useEffect, useMemo, useRef, useState } from "react";
import { useStore } from "../store";

export function QuickOpen({ onClose }: { onClose: () => void }) {
  const notes = useStore((s) => s.notes);
  const openNote = useStore((s) => s.openNote);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q ? notes.filter((n) => n.path.toLowerCase().includes(q)) : notes;
    return hits.slice(0, 50);
  }, [notes, query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.children[index]?.scrollIntoView({ block: "nearest" });
  }, [index]);

  function choose(at = index) {
    const note = matches[at];
    if (note) void openNote(note.path);
    onClose();
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder="Go to note…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setIndex((i) => Math.min(i + 1, matches.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              choose();
            } else if (e.key === "Escape") {
              e.preventDefault();
              onClose();
            }
          }}
        />
        <ul ref={listRef}>
          {matches.map((note, i) => (
            <li key={note.path} className={i === index ? "active" : ""}>
              <button onMouseEnter={() => setIndex(i)} onClick={() => choose(i)}>
                {note.path.replace(/\.md$/i, "")}
              </button>
            </li>
          ))}
          {matches.length === 0 && <li className="empty">No matching notes</li>}
        </ul>
      </div>
    </div>
  );
}
