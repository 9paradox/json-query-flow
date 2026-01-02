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
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Loader2, TrashIcon } from "lucide-react";
import { toast } from "sonner";

export default function QueryNode({ id }: NodeProps) {
  const [queryMode, setQueryMode] = useState<string>("jsonata");
  const [title, setTitle] = useState<string>("Query");
  const [prevTitle, setPrevTitle] = useState<string>("Query");
  const [editing, setEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const node = useStore((s) => s.nodes.find((n) => n.id === id));

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

  function onChange(val) {
    const queryData = {
      jsonQuery: node?.data?.jsonQuery,
      nlQuery: node?.data?.nlQuery,
    };
    if (queryMode === "jsonata") {
      queryData.jsonQuery = val;
    } else {
      queryData.nlQuery = val;
    }
    return useStore.getState().updateNodeData(id, {
      ...queryData,
    });
  }

  function run() {
    if (queryMode !== "jsonata" && !useStore.getState().apiKey) {
      toast.error("Please set your API key in the 'Connect with AI' button.");
      return;
    }
    useStore.getState().runQueryNode(id, queryMode);
  }

  return (
    <Card>
      <CardHeader className="px-4 py-1">
        <div className="flex items-center justify-between gap-2">
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

          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
            aria-label="Delete"
            title="Delete"
            onClick={() => useStore.getState().removeNode(id)}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="nodrag px-4 pb-4 pt-0">
        <div
          role="region"
          aria-label="Query editor"
          tabIndex={0}
          className="w-[360px] h-[100px] resize both overflow-auto rounded-md border
               focus:outline-none focus:ring-2 focus:ring-ring
               focus:ring-offset-2 focus:ring-offset-background"
        >
          <Editor
            height="100%"
            width="100%"
            language={queryMode === "jsonata" ? "jsonata" : "plaintext"}
            beforeMount={jsonataMode}
            theme="jsonataTheme"
            value={
              queryMode === "jsonata"
                ? node?.data?.jsonQuery
                : node?.data?.nlQuery
            }
            onChange={onChange}
            options={{ minimap: { enabled: false } }}
          />
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 px-4 pb-4 pt-0">
        <Select value={queryMode} onValueChange={setQueryMode}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Query type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="jsonata">JSONata Query</SelectItem>
            <SelectItem value="natural-language">Natural Language</SelectItem>
          </SelectContent>
        </Select>

        <Button
          size="sm"
          onClick={run}
          className="px-3 py-1.5 text-sm font-medium flex items-center gap-2"
          disabled={node?.data.isLoading}
        >
          {node?.data.isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          )}
          <span>{node?.data.isLoading ? "Running" : "Run"}</span>
        </Button>
      </CardFooter>

      <Handle
        type="target"
        position={Position.Left}
        id="query-node-input"
        style={{ padding: 4 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="query-node-output"
        style={{ padding: 4 }}
      />
    </Card>
  );
}
