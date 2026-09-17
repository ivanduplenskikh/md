import { useStore } from "../store";
import { basename, stripExtension } from "../lib/paths";

export function Tabs() {
  const openTabs = useStore((s) => s.openTabs);
  const activePath = useStore((s) => s.activePath);
  const dirty = useStore((s) => s.dirty);
  const openNote = useStore((s) => s.openNote);
  const closeTab = useStore((s) => s.closeTab);

  if (openTabs.length === 0) return null;

  return (
    <div className="tabs" role="tablist">
      {openTabs.map((path) => {
        const active = path === activePath;
        return (
          <div key={path} className={`tab ${active ? "active" : ""}`}>
            <button role="tab" aria-selected={active} onClick={() => openNote(path)}>
              {stripExtension(basename(path))}
            </button>
            <button
              className="close"
              aria-label={`Close ${path}`}
              title="Close"
              onClick={() => void closeTab(path)}
            >
              {active && dirty ? "●" : "×"}
            </button>
          </div>
        );
      })}
    </div>
  );
}
