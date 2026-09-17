import {
  readTextFile,
  writeTextFile,
  readDir,
  mkdir,
  remove,
  rename,
  exists,
} from "@tauri-apps/plugin-fs";
import { open } from "@tauri-apps/plugin-dialog";
import { Store } from "@tauri-apps/plugin-store";

const STORE_FILE = "md.json";
const VAULT_KEY = "vaultPath";

export type Note = {
  /** Path relative to the vault root, always using "/" separators. */
  path: string;
  name: string;
};

let storePromise: Promise<Store> | null = null;
function store() {
  storePromise ??= Store.load(STORE_FILE);
  return storePromise;
}

export function join(...parts: string[]) {
  return parts.filter(Boolean).join("/").replace(/\/+/g, "/");
}

export async function loadSavedVault(): Promise<string | null> {
  const saved = await (await store()).get<string>(VAULT_KEY);
  if (!saved) return null;
  // Folder may have been moved or deleted since last run.
  return (await exists(saved)) ? saved : null;
}

export async function pickVault(): Promise<string | null> {
  const selected = await open({ directory: true, multiple: false });
  if (typeof selected !== "string") return null;
  const s = await store();
  await s.set(VAULT_KEY, selected);
  await s.save();
  return selected;
}

export async function listNotes(vault: string): Promise<Note[]> {
  const notes: Note[] = [];

  async function walk(relative: string) {
    const entries = await readDir(relative ? join(vault, relative) : vault);
    for (const entry of entries) {
      if (entry.name.startsWith(".") || entry.name === "assets") continue;
      const rel = relative ? join(relative, entry.name) : entry.name;
      if (entry.isDirectory) {
        await walk(rel);
      } else if (entry.name.toLowerCase().endsWith(".md")) {
        notes.push({ path: rel, name: entry.name.replace(/\.md$/i, "") });
      }
    }
  }

  await walk("");
  return notes.sort((a, b) => a.path.localeCompare(b.path));
}

export function readNote(vault: string, path: string) {
  return readTextFile(join(vault, path));
}

export function writeNote(vault: string, path: string, content: string) {
  return writeTextFile(join(vault, path), content);
}

export async function createNote(vault: string, name = "Untitled"): Promise<Note> {
  let path = `${name}.md`;
  let n = 1;
  while (await exists(join(vault, path))) {
    path = `${name} ${++n}.md`;
  }
  await writeTextFile(join(vault, path), `# ${path.replace(/\.md$/, "")}\n\n`);
  return { path, name: path.replace(/\.md$/, "") };
}

export async function renameNote(vault: string, path: string, newName: string) {
  const dir = path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
  const safe = newName.replace(/[\\/:*?"<>|]/g, "-").trim() || "Untitled";
  const newPath = dir ? join(dir, `${safe}.md`) : `${safe}.md`;
  if (newPath === path) return path;
  if (await exists(join(vault, newPath))) throw new Error("A note with that name already exists");
  await rename(join(vault, path), join(vault, newPath));
  return newPath;
}

export function deleteNote(vault: string, path: string) {
  return remove(join(vault, path));
}

export async function ensureDir(vault: string, relative: string) {
  const dir = join(vault, relative);
  if (!(await exists(dir))) await mkdir(dir, { recursive: true });
  return dir;
}
