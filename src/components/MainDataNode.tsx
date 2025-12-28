import { Handle, Position, NodeProps } from "reactflow";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import { useStore } from "@/store";

export default function MainDataNode({ id }: NodeProps) {
  const node = useStore((s) => s.nodes.find((n) => n.id === id));
  const value = node?.data?.value ?? {};
  const pretty = (() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "{}";
    }
  })();

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Main Data</CardTitle>
      </CardHeader>
      <CardContent className="nodrag">
        <div
          style={{ width: 360, height: 220, resize: "both", overflow: "auto" }}
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
