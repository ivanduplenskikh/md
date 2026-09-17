type MdNode = {
  type: string;
  value?: string;
  children?: MdNode[];
  data?: { hName?: string; hProperties?: Record<string, unknown> };
};

const TYPES = ["note", "tip", "important", "warning", "caution"] as const;
const MARKER = new RegExp(`^\\[!(${TYPES.join("|")})\\]\\s*`, "i");

function titleNode(kind: string): MdNode {
  return {
    type: "paragraph",
    data: { hProperties: { className: "markdown-alert-title" } },
    children: [{ type: "text", value: kind[0].toUpperCase() + kind.slice(1) }],
  };
}

function transform(node: MdNode): void {
  node.children?.forEach(transform);
  if (node.type !== "blockquote") return;

  const [first] = node.children ?? [];
  const lead = first?.type === "paragraph" ? first.children?.[0] : undefined;
  if (!lead || lead.type !== "text") return;

  const match = MARKER.exec(lead.value ?? "");
  if (!match) return;

  const kind = match[1].toLowerCase();
  lead.value = (lead.value ?? "").slice(match[0].length);
  if (!lead.value && first.children?.length === 1) node.children?.shift();

  node.data = {
    hName: "div",
    hProperties: { className: `markdown-alert markdown-alert-${kind}` },
  };
  node.children?.unshift(titleNode(kind));
}

/** GitHub-style alerts: `> [!NOTE]` blockquotes become styled callout divs. */
export function remarkAlert() {
  return (tree: MdNode) => transform(tree);
}
