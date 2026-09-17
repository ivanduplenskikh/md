import { $prose } from "@milkdown/kit/utils";
import { Plugin, PluginKey } from "@milkdown/kit/prose/state";
import { Decoration, DecorationSet } from "@milkdown/kit/prose/view";
import { ALERT_MARKER, alertTitle } from "./alerts";

/** Renders `> [!NOTE]` blockquotes as styled callouts while editing. */
export const alertPlugin = $prose(
  () =>
    new Plugin({
      key: new PluginKey("MD_ALERT_DECORATIONS"),
      props: {
        decorations(state) {
          const decorations: Decoration[] = [];

          state.doc.descendants((node, pos) => {
            if (node.type.name !== "blockquote") return;
            const match = ALERT_MARKER.exec(node.firstChild?.textContent ?? "");
            if (!match) return;

            const kind = match[1].toLowerCase();
            decorations.push(
              Decoration.node(pos, pos + node.nodeSize, {
                class: `markdown-alert markdown-alert-${kind}`,
                "data-alert": alertTitle(kind),
              }),
            );

            // Skip the blockquote and paragraph openings to reach the marker text.
            const from = pos + 2;
            decorations.push(
              Decoration.inline(from, from + match[0].trimEnd().length, {
                class: "alert-marker",
              }),
            );
          });

          return DecorationSet.create(state.doc, decorations);
        },
      },
    }),
);
