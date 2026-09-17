import { getCurrentWindow } from "@tauri-apps/api/window";
import { useEffect, useState } from "react";
import { isTauri } from "../lib/vault";

const appWindow = isTauri ? getCurrentWindow() : null;

export function TitleBar() {
  const [maximized, setMaximized] = useState(false);

  useEffect(() => {
    if (!appWindow) return;
    void appWindow.isMaximized().then(setMaximized);
    const unlisten = appWindow.onResized(() => {
      void appWindow.isMaximized().then(setMaximized);
    });
    return () => {
      void unlisten.then((off) => off());
    };
  }, []);

  return (
    <div className="titlebar" data-tauri-drag-region>
      <img className="app-icon" src="/icon.png" alt="" data-tauri-drag-region />
      <span className="app-name" data-tauri-drag-region>
        md
      </span>
      {appWindow && (
        <div className="window-controls">
          <button aria-label="Minimize" onClick={() => appWindow.minimize()}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <rect x="0" y="4.5" width="10" height="1" fill="currentColor" />
            </svg>
          </button>
          <button aria-label="Maximize" onClick={() => appWindow.toggleMaximize()}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              {maximized ? (
                <path
                  d="M2.5 0.5h7v7h-2M0.5 2.5h7v7h-7z"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              ) : (
                <rect
                  x="0.5"
                  y="0.5"
                  width="9"
                  height="9"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                />
              )}
            </svg>
          </button>
          <button className="close" aria-label="Close" onClick={() => appWindow.close()}>
            <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden="true">
              <path d="M0 0l10 10M10 0L0 10" stroke="currentColor" strokeWidth="1" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
