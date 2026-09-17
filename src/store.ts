import { create } from "zustand";
import * as vault from "./lib/vault";
import type { Note } from "./lib/vault";

type State = {
  vaultPath: string | null;
  notes: Note[];
  activePath: string | null;
  content: string;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  init: () => Promise<void>;
  chooseVault: () => Promise<void>;
  openFile: () => Promise<void>;
  refresh: () => Promise<void>;
  openNote: (path: string) => Promise<void>;
  setContent: (content: string) => void;
  save: () => Promise<void>;
  newNote: () => Promise<void>;
  renameActive: (name: string) => Promise<void>;
  deleteNote: (path: string) => Promise<void>;
};

export const useStore = create<State>((set, get) => {
  async function openVault(path: string) {
    set({ vaultPath: path, activePath: null, content: "", dirty: false });
    const notes = await vault.listNotes(path);
    set({ notes });
    if (notes[0]) await get().openNote(notes[0].path);
  }

  return {
    vaultPath: null,
    notes: [],
    activePath: null,
    content: "",
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
      const { vaultPath, dirty } = get();
      if (!vaultPath) return;
      if (dirty) await get().save();
      try {
        const content = await vault.readNote(vaultPath, path);
        set({ activePath: path, content, dirty: false, error: null });
      } catch (e) {
        set({ error: String(e) });
      }
    },

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
        set({ activePath: newPath });
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
        if (activePath === path) set({ activePath: null, content: "", dirty: false });
        await get().refresh();
      } catch (e) {
        set({ error: String(e) });
      }
    },
  };
});
