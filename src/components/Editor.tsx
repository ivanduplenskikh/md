import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { EditorView } from "@codemirror/view";
import { useStore } from "../store";

const theme = EditorView.theme({
  "&": { height: "100%", fontSize: "14px" },
  ".cm-scroller": { fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace" },
});

export function Editor() {
  const { content, setContent } = useStore();

  return (
    <div className="editor">
      <CodeMirror
        value={content}
        onChange={setContent}
        extensions={[markdown({ base: markdownLanguage }), EditorView.lineWrapping, theme]}
        basicSetup={{ lineNumbers: false, foldGutter: false, highlightActiveLine: false }}
        height="100%"
      />
    </div>
  );
}
