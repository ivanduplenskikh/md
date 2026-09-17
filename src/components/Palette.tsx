import { useEffect, useMemo, useRef, useState } from "react";

export type PaletteItem = {
  id: string;
  label: string;
  hint?: string;
  run: () => void;
};

export function Palette({
  items,
  placeholder,
  emptyLabel,
  onClose,
}: {
  items: PaletteItem[];
  placeholder: string;
  emptyLabel: string;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    const hits = q ? items.filter((item) => item.label.toLowerCase().includes(q)) : items;
    return hits.slice(0, 100);
  }, [items, query]);

  useEffect(() => setIndex(0), [query]);

  useEffect(() => {
    listRef.current?.children[index]?.scrollIntoView({ block: "nearest" });
  }, [index]);

  function choose(at = index) {
    matches[at]?.run();
    onClose();
  }

  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette" onMouseDown={(e) => e.stopPropagation()}>
        <input
          autoFocus
          placeholder={placeholder}
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
          {matches.map((item, i) => (
            <li key={item.id} className={i === index ? "active" : ""}>
              <button onMouseEnter={() => setIndex(i)} onClick={() => choose(i)}>
                <span>{item.label}</span>
                {item.hint && <kbd>{item.hint}</kbd>}
              </button>
            </li>
          ))}
          {matches.length === 0 && <li className="empty">{emptyLabel}</li>}
        </ul>
      </div>
    </div>
  );
}
