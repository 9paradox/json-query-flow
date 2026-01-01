import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import { useStore } from "@/store";
import { useRef, useState } from "react";
import { jsonToSchemaLite } from "@/lib/jsonToSchemaLite";

export default function MainDataNode({ id }: NodeProps) {
  const node = useStore((s) => s.nodes.find((n) => n.id === id));
  const editorRef = useRef(null);
  const [, setIsFocused] = useState(true);
  const value = node?.data?.jsonData ?? {};
  const pretty = (() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "{}";
    }
  })();

  function handleEditorDidMount(editor, _monaco) {
    editorRef.current = editor;

    editor.onDidBlurEditorWidget(async () => {
      console.log("blurred");
      setIsFocused(false);
      let schema = null;
      try {
        const inputValue = useStore.getState().nodes.find((n) => n.id === id)
          ?.data?.jsonData;
        schema = jsonToSchemaLite(inputValue ?? {});
      } catch {
        schema = null;
      }
      useStore.getState().updateNodeData(id, { schema });
    });

    editor.onDidFocusEditorWidget(async () => {
      console.log("focused");
      setIsFocused(true);
    });
  }

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Main Data</CardTitle>
      </CardHeader>
      <CardContent className="nodrag">
        <div
          style={{ width: 550, height: 220, resize: "both", overflow: "auto" }}
        >
          <Editor
            height="100%"
            width="100%"
            language="json"
            theme="json"
            value={pretty}
            onChange={(text) => {
              try {
                const parsed = text ? JSON.parse(text) : {};
                useStore.getState().updateNodeData(id, { value: parsed });
              } catch {
                // ignore parse errors to allow free typing; only update on valid JSON
              }
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </CardContent>
      <Handle
        type="source"
        style={{ padding: 4 }}
        position={Position.Right}
        id="main-data-node-output"
      />
    </Card>
  );
}
