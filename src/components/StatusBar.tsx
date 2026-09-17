import { useStore } from "../store";

export function StatusBar() {
  const content = useStore((s) => s.content);
  const cursor = useStore((s) => s.cursor);
  const dirty = useStore((s) => s.dirty);
  const saving = useStore((s) => s.saving);
  const vaultPath = useStore((s) => s.vaultPath);
  const activePath = useStore((s) => s.activePath);
  const chooseVault = useStore((s) => s.chooseVault);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content ? content.split("\n").length : 0;

  return (
    <footer className="statusbar">
      <button
        className="folder"
        onClick={chooseVault}
        title={vaultPath ? `${vaultPath}\nClick to change folder` : "Click to choose a folder"}
      >
        {vaultPath ?? "No folder opened"}
      </button>
      {activePath && <span className="sep">›</span>}
      <span className="file">{activePath ?? ""}</span>
      <span className="spacer" />
      <span>
        Ln {cursor.line}, Col {cursor.column}
      </span>
      <span>{lines} lines</span>
      <span>{words} words</span>
      <span>{content.length} chars</span>
      <span className={dirty ? "dirty" : ""}>{saving ? "Saving…" : dirty ? "Unsaved" : "Saved"}</span>
    </footer>
  );
}
