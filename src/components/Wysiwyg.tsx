import { useEffect, useRef } from "react";
import { Crepe } from "@milkdown/crepe";
import commonCss from "@milkdown/crepe/theme/common/style.css?inline";
import lightCss from "@milkdown/crepe/theme/frame.css?inline";
import darkCss from "@milkdown/crepe/theme/frame-dark.css?inline";
import { usePrefersDark } from "../lib/useDark";
import { alertPlugin } from "../lib/milkdownAlert";
import { useStore } from "../store";

export function Wysiwyg() {
  const host = useRef<HTMLDivElement>(null);
  const dark = usePrefersDark();
  const setContent = useStore((s) => s.setContent);

  useEffect(() => {
    const root = host.current;
    if (!root) return;

    // Read once: Crepe owns the document afterwards and pushes changes back.
    const crepe = new Crepe({ root, defaultValue: useStore.getState().content });
    crepe.editor.use(alertPlugin);
    crepe.on((listener) => {
      listener.markdownUpdated((_ctx, markdown) => setContent(markdown));
    });
    void crepe.create();

    return () => {
      void crepe.destroy();
      root.replaceChildren();
    };
  }, [setContent]);

  return (
    <div className="wysiwyg">
      <style>{commonCss + (dark ? darkCss : lightCss)}</style>
      <div ref={host} />
    </div>
  );
}
