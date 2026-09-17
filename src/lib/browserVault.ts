import type { Note } from "./vault";
import { sanitizeName, uniqueNotePath } from "./noteNames";
import { stripExtension } from "./paths";

// In-memory/localStorage vault used when the UI runs outside the Tauri webview.
const KEY = "md:browser-vault";
export const BROWSER_VAULT = "(browser storage)";

type Docs = Record<string, string>;

function read(): Docs {
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "{}") as Docs;
  } catch {
    return {};
  }
}

function write(docs: Docs) {
  localStorage.setItem(KEY, JSON.stringify(docs));
}

export const browserVault = {
  loadSavedVault: async () => (localStorage.getItem(KEY) ? BROWSER_VAULT : null),

  pickVault: async () => {
    const docs = read();
    if (Object.keys(docs).length === 0) {
      write({ "Welcome.md": "# Welcome\n\nBrowser preview — notes live in localStorage.\n" });
    } else {
      write(docs);
    }
    return BROWSER_VAULT;
  },

  listNotes: async (): Promise<Note[]> =>
    Object.keys(read())
      .sort()
      .map((path) => ({ path, name: stripExtension(path) })),

  readNote: async (_vault: string, path: string) => read()[path] ?? "",

  writeNote: async (_vault: string, path: string, content: string) => {
    const docs = read();
    docs[path] = content;
    write(docs);
  },

  createNote: async (_vault: string, name = "Untitled"): Promise<Note> => {
    const docs = read();
    const path = await uniqueNotePath(name, (candidate) => candidate in docs);
    docs[path] = `# ${stripExtension(path)}\n\n`;
    write(docs);
    return { path, name: stripExtension(path) };
  },

  renameNote: async (_vault: string, path: string, newName: string) => {
    const docs = read();
    const newPath = `${sanitizeName(newName)}.md`;
    if (newPath === path) return path;
    if (docs[newPath]) throw new Error("A note with that name already exists");
    docs[newPath] = docs[path];
    delete docs[path];
    write(docs);
    return newPath;
  },

  deleteNote: async (_vault: string, path: string) => {
    const docs = read();
    delete docs[path];
    write(docs);
  },
};
