import { Store } from "@tauri-apps/plugin-store";
import { isTauri } from "./vault";

export type Settings = {
  mode: string;
  sidebarWidth: number;
  collapsed: boolean;
  split: number;
  openTabs: string[];
  activePath: string | null;
};

const STORE_FILE = "md.json";
const KEY = "ui";

let storePromise: Promise<Store> | null = null;
function store() {
  storePromise ??= Store.load(STORE_FILE);
  return storePromise;
}

let cache: Partial<Settings> = {};

export async function loadSettings(): Promise<Partial<Settings>> {
  try {
    if (isTauri) {
      cache = (await (await store()).get<Partial<Settings>>(KEY)) ?? {};
    } else {
      cache = JSON.parse(localStorage.getItem(`md:${KEY}`) ?? "{}") as Partial<Settings>;
    }
  } catch {
    cache = {};
  }
  return cache;
}

export async function saveSettings(patch: Partial<Settings>) {
  cache = { ...cache, ...patch };
  try {
    if (isTauri) {
      const s = await store();
      await s.set(KEY, cache);
      await s.save();
    } else {
      localStorage.setItem(`md:${KEY}`, JSON.stringify(cache));
    }
  } catch {
    // Persisting preferences must never break the app.
  }
}
