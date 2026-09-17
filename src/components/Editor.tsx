import { useEffect, useState } from "react";
import MonacoEditor from "@monaco-editor/react";
import "../lib/monaco";
import { useStore } from "../store";

function usePrefersDark() {
  const [dark, setDark] = useState(() => matchMedia("(prefers-color-scheme: dark)").matches);
  useEffect(() => {
    const mq = matchMedia("(prefers-color-scheme: dark)");
    const onChange = (e: MediaQueryListEvent) => setDark(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return dark;
}

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

export function Editor() {
  const content = useStore((s) => s.content);
  const setContent = useStore((s) => s.setContent);
  const dark = usePrefersDark();

  return (
    <div className="editor">
      <MonacoEditor
        language="markdown"
        theme={dark ? "vs-dark" : "vs"}
        value={content}
        onChange={(value) => setContent(value ?? "")}
        options={options}
        height="100%"
      />
    </div>
  );
}
