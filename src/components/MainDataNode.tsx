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
      setIsFocused(false);
      let schema = null;
      try {
        schema = await useStore.getState().generateJsonSchemaForNode(id);
        console.log("Generated schema:", schema);
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
      <CardHeader className="flex items-center justify-between px-4 py-3">
        <CardTitle className="text-sm font-semibold">Main Data</CardTitle>
      </CardHeader>

      <CardContent className="nodrag px-4 pb-4 pt-0">
        <div className="w-[550px] h-[220px] resize both overflow-auto rounded-md border">
          <Editor
            height="100%"
            width="100%"
            language="json"
            theme="json"
            value={pretty}
            onChange={(text) => {
              try {
                const parsed = text ? JSON.parse(text) : {};
                useStore.getState().updateNodeData(id, { jsonData: parsed });
              } catch {
                // ignore parse errors
              }
            }}
            onMount={handleEditorDidMount}
          />
        </div>
      </CardContent>

      <Handle
        type="source"
        position={Position.Right}
        id="main-data-node-output"
        style={{ padding: 4 }}
      />
    </Card>
  );
}
