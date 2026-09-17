const SHORTCUTS: [string, string][] = [
  ["Ctrl + S", "Save now"],
  ["Ctrl + N", "New note"],
  ["Ctrl + O", "Open a .md file"],
  ["Ctrl + P", "Quick open by name"],
  ["Ctrl + 1…9", "Jump to Nth note"],
  ["Ctrl + E", "Cycle edit / split / preview"],
  ["Ctrl + /", "Show this list"],
  ["Esc", "Close"],
];

export function Shortcuts({ onClose }: { onClose: () => void }) {
  return (
    <div className="palette-backdrop" onMouseDown={onClose}>
      <div className="palette shortcuts" onMouseDown={(e) => e.stopPropagation()}>
        <header>Keyboard shortcuts</header>
        <dl>
          {SHORTCUTS.map(([keys, label]) => (
            <div key={keys}>
              <dt>
                <kbd>{keys}</kbd>
              </dt>
              <dd>{label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
