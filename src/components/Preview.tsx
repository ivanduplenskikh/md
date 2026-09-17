import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { openUrl } from "@tauri-apps/plugin-opener";
import { remarkAlert } from "../lib/remarkAlert";
import { isTauri } from "../lib/vault";
import { useStore } from "../store";

const remarkPlugins = [remarkGfm, remarkAlert];

// Without this, clicking a link navigates the whole webview away from the app.
const components = {
  a({ href, children, ...props }: React.ComponentProps<"a">) {
    return (
      <a
        {...props}
        href={href}
        onClick={(e) => {
          if (!href || !/^https?:/i.test(href)) return;
          e.preventDefault();
          if (isTauri) void openUrl(href);
          else window.open(href, "_blank", "noopener,noreferrer");
        }}
      >
        {children}
      </a>
    );
  },
};

export function Preview() {
  const content = useStore((s) => s.content);

  return (
    <div className="preview">
      <article className="markdown-body">
        <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
          {content}
        </ReactMarkdown>
      </article>
    </div>
  );
}
