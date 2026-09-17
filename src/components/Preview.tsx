import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { remarkAlert } from "../lib/remarkAlert";
import { useStore } from "../store";

const remarkPlugins = [remarkGfm, remarkAlert];

export function Preview() {
  const content = useStore((s) => s.content);

  return (
    <div className="preview">
      <article className="markdown-body">
        <ReactMarkdown remarkPlugins={remarkPlugins}>{content}</ReactMarkdown>
      </article>
    </div>
  );
}
