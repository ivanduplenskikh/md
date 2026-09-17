import MonacoEditor from "@monaco-editor/react";
import "../lib/monaco";
import { usePrefersDark } from "../lib/useDark";
import { useStore } from "../store";

const options = {
  wordWrap: "on",
  minimap: { enabled: false },
  fontSize: 14,
  fontFamily: "ui-monospace, SFMono-Regular, Consolas, monospace",
  lineHeight: 1.6,
  scrollBeyondLastLine: false,
  automaticLayout: true,
  padding: { top: 12, bottom: 12 },
  smoothScrolling: true,
  tabSize: 2,
  quickSuggestions: false,
  occurrencesHighlight: "off",
  unicodeHighlight: { ambiguousCharacters: false },
} as const;

const zenOptions = {
  ...options,
  fontSize: 17,
  fontFamily: "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif",
  lineHeight: 1.8,
  lineNumbers: "off",
  glyphMargin: false,
  folding: false,
  lineDecorationsWidth: 0,
  lineNumbersMinChars: 0,
  renderLineHighlight: "none",
  padding: { top: 48, bottom: 240 },
  overviewRulerLanes: 0,
  scrollbar: { vertical: "hidden" },
} as const;

export function Editor({ zen = false }: { zen?: boolean }) {
  const content = useStore((s) => s.content);
  const setContent = useStore((s) => s.setContent);
  const setCursor = useStore((s) => s.setCursor);
  const dark = usePrefersDark();

  return (
    <div className={`editor ${zen ? "zen" : ""}`}>
      <MonacoEditor
        language="markdown"
        theme={dark ? "vs-dark" : "vs"}
        value={content}
        onChange={(value) => setContent(value ?? "")}
        onMount={(editor) =>
          editor.onDidChangeCursorPosition((e) =>
            setCursor({ line: e.position.lineNumber, column: e.position.column }),
          )
        }
        options={zen ? zenOptions : options}
        height="100%"
      />
    </div>
  );
}
