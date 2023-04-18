import Editor, { useMonaco } from "@monaco-editor/react";
import React, { useEffect } from "react";

const EditorView = ({ value, onChange }: EditorViewProps) => {
  const monaco = useMonaco();

  return (
    <Editor
      height="100%"
      language="yaml"
      theme="light"
      loading="Loading..."
      options={{
        minimap: { enabled: false },
        smoothScrolling: true,
        cursorSmoothCaretAnimation: true,
        scrollBeyondLastLine: true,
      }}
      value={value}
      onChange={onChange}
    />
  );
};

export interface EditorViewProps {
  value: string;
  onChange: (text?: string) => void;
}

export default EditorView;
