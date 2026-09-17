import { Menu } from "@tauri-apps/api/menu";
import { isTauri } from "./vault";

export type MenuAction = { label: string; run: () => void };

/**
 * Pops up the OS menu in the desktop app. Returns false in the browser preview,
 * where the caller falls back to the HTML menu.
 */
export async function popupNativeMenu(actions: MenuAction[]) {
  if (!isTauri) return false;
  const menu = await Menu.new({
    items: actions.map((action, i) => ({
      id: `item-${i}`,
      text: action.label,
      action: action.run,
    })),
  });
  await menu.popup();
  return true;
}
