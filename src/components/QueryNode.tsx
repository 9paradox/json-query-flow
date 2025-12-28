import { Handle, Position, NodeProps } from "reactflow";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import jsonataMode from "@/editor/jsonataMode";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store";
import { TrashIcon } from "@radix-ui/react-icons";
import { useEffect, useRef, useState } from "react";

export default function QueryNode({ id }: NodeProps) {
  const [title, setTitle] = useState<string>("Query");
  const [prevTitle, setPrevTitle] = useState<string>("Query");
  const [editing, setEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));
  const queryValue = (node?.data as any)?.query ?? "";

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit(next?: string) {
    const value = (next ?? title).trim();
    setTitle(value.length ? value : prevTitle);
    setPrevTitle(value.length ? value : prevTitle);
    setEditing(false);
  }

  function cancel() {
    setTitle(prevTitle);
    setEditing(false);
  }

  return (
    <Card>
      <CardHeader className="px-4 py-1">
        <div className="flex items-center justify-between gap-2">
          {/* Title / Inline edit */}
          {editing ? (
            <input
              ref={inputRef}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={() => commit()}
              onKeyDown={(e) => {
                if (e.key === "Enter") commit();
                if (e.key === "Escape") cancel();
              }}
              className="text-base font-semibold bg-transparent border border-input rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
            />
          ) : (
            <CardTitle
              className="text-base font-semibold cursor-text select-text"
              title="Double-click to rename"
              onDoubleClick={() => setEditing(true)}
            >
              {title}
            </CardTitle>
          )}
          {/* Actions */}
          <Button
            variant="ghost"
            size="icon"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Delete"
            title="Delete"
            onClick={() => useStore.getState().removeNode(id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="nodrag">
        <div
          style={{ width: 360, height: 100, resize: "both", overflow: "auto" }}
        >
          <Editor
            height="100%"
            width="100%"
            language="jsonata"
            beforeMount={(monaco) => jsonataMode(monaco)}
            theme="jsonataTheme"
            value={queryValue}
            onChange={(val) =>
              useStore.getState().updateNodeData(id, { query: val ?? "" })
            }
          />
        </div>
      </CardContent>
      <CardFooter className="p-0 px-4 pb-4 pt-0 justify-end">
        <Button size="sm" onClick={() => useStore.getState().runQueryNode(id)}>
          Run
        </Button>
      </CardFooter>
      <Handle
        type="target"
        style={{ padding: 4 }}
        position={Position.Left}
        id="query-node-input"
      />
      <Handle
        type="source"
        style={{ padding: 4 }}
        position={Position.Right}
        id="query-node-output"
      />
    </Card>
  );
}
