import { useStore } from "../store";

export function StatusBar() {
  const content = useStore((s) => s.content);
  const cursor = useStore((s) => s.cursor);
  const dirty = useStore((s) => s.dirty);
  const saving = useStore((s) => s.saving);
  const vaultPath = useStore((s) => s.vaultPath);
  const activePath = useStore((s) => s.activePath);

  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const lines = content ? content.split("\n").length : 0;

  return (
    <footer className="statusbar">
      <span className="folder" title={vaultPath ?? ""}>
        {vaultPath ?? "No folder opened"}
      </span>
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
