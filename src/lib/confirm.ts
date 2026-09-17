import { confirm as tauriConfirm } from "@tauri-apps/plugin-dialog";
import { isTauri } from "./vault";

/** Native dialog in the app, browser dialog in the web preview. */
export function confirmDelete(name: string) {
  const message = `Delete "${name}"?`;
  if (!isTauri) return Promise.resolve(window.confirm(message));
  return tauriConfirm(message, { title: "Delete note", kind: "warning" });
}
