import { create } from "zustand";
import * as vault from "./lib/vault";
import type { Note } from "./lib/vault";

type State = {
  vaultPath: string | null;
  notes: Note[];
  openTabs: string[];
  activePath: string | null;
  content: string;
  cursor: { line: number; column: number };
  dirty: boolean;
  saving: boolean;
  error: string | null;
  init: () => Promise<void>;
  chooseVault: () => Promise<void>;
  openFile: () => Promise<void>;
  refresh: () => Promise<void>;
  openNote: (path: string) => Promise<void>;
  closeTab: (path: string) => Promise<void>;
  setCursor: (cursor: { line: number; column: number }) => void;
  setContent: (content: string) => void;
  save: () => Promise<void>;
  newNote: () => Promise<void>;
  renameActive: (name: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
};

export const useStore = create<State>((set, get) => {
  async function openVault(path: string) {
    set({ vaultPath: path, openTabs: [], activePath: null, content: "", dirty: false });
    const notes = await vault.listNotes(path);
    set({ notes });
    if (notes[0]) await get().openNote(notes[0].path);
  }

  return {
    vaultPath: null,
    notes: [],
    openTabs: [],
    activePath: null,
    content: "",
    cursor: { line: 1, column: 1 },
    dirty: false,
    saving: false,
    error: null,

    init: async () => {
      try {
        const saved = await vault.loadSavedVault();
        if (saved) await openVault(saved);
      } catch (e) {
        set({ error: String(e) });
      }
    },

    chooseVault: async () => {
      try {
        const picked = await vault.pickVault();
        if (picked) await openVault(picked);
      } catch (e) {
        set({ error: String(e) });
      }
    },

    openFile: async () => {
      try {
        const picked = await vault.pickNoteFile();
        if (!picked) return;
        await openVault(picked.vault);
        await get().openNote(picked.path);
      } catch (e) {
        set({ error: String(e) });
      }
    },

    refresh: async () => {
      const { vaultPath } = get();
      if (!vaultPath) return;
      set({ notes: await vault.listNotes(vaultPath) });
    },

    openNote: async (path) => {
      const { vaultPath, dirty, openTabs } = get();
      if (!vaultPath) return;
      if (dirty) await get().save();
      try {
        const content = await vault.readNote(vaultPath, path);
        set({
          activePath: path,
          content,
          dirty: false,
          error: null,
          openTabs: openTabs.includes(path) ? openTabs : [...openTabs, path],
        });
      } catch (e) {
        set({ error: String(e) });
      }
    },

    closeTab: async (path) => {
      const { openTabs, activePath } = get();
      const remaining = openTabs.filter((p) => p !== path);
      if (activePath !== path) {
        set({ openTabs: remaining });
        return;
      }
      const neighbour = remaining[Math.min(openTabs.indexOf(path), remaining.length - 1)];
      set({ openTabs: remaining });
      if (neighbour) await get().openNote(neighbour);
      else set({ activePath: null, content: "", dirty: false });
    },

    setCursor: (cursor) => set({ cursor }),

    setContent: (content) => set({ content, dirty: true }),

    save: async () => {
      const { vaultPath, activePath, content, dirty } = get();
      if (!vaultPath || !activePath || !dirty) return;
      set({ saving: true });
      try {
        await vault.writeNote(vaultPath, activePath, content);
        set({ dirty: false, error: null });
      } catch (e) {
        set({ error: String(e) });
      } finally {
        set({ saving: false });
      }
    },

    newNote: async () => {
      const { vaultPath } = get();
      if (!vaultPath) return;
      if (get().dirty) await get().save();
      const note = await vault.createNote(vaultPath);
      await get().refresh();
      await get().openNote(note.path);
    },

    renameActive: async (name) => {
      const { vaultPath, activePath } = get();
      if (!vaultPath || !activePath) return;
      try {
        if (get().dirty) await get().save();
        const newPath = await vault.renameNote(vaultPath, activePath, name);
        set({
          activePath: newPath,
          openTabs: get().openTabs.map((p) => (p === activePath ? newPath : p)),
        });
        await get().refresh();
      } catch (e) {
        set({ error: String(e) });
      }
    },

    deleteNote: async (path) => {
      const { vaultPath, activePath } = get();
      if (!vaultPath) return;
      try {
        await vault.deleteNote(vaultPath, path);
        set({ openTabs: get().openTabs.filter((p) => p !== path) });
        if (activePath === path) {
          const next = get().openTabs[0];
          if (next) await get().openNote(next);
          else set({ activePath: null, content: "", dirty: false });
        }
        await get().refresh();
      } catch (e) {
        set({ error: String(e) });
      }
    },
  };
});
