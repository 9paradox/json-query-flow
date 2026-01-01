import { Handle, Position, NodeProps } from "reactflow";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Editor } from "@monaco-editor/react";
import { useStore } from "@/store";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { TrashIcon } from "lucide-react";
import { jsonToSchemaLite } from "@/lib/jsonToSchemaLite";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { analyzeJsonForVisualization } from "@/lib/analyzeJsonForVisualization";

export default function JsonDataNode({ id }: NodeProps) {
  const node = useStore((s) => s.nodes.find((n) => n.id === id));
  const [visualModeEnabled, setVisualModeEnabled] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<string>("json");
  const [supportedVisual, setSupportedVisual] = useState<string[]>(["json"]);
  const editorRef = useRef(null);
  const [isFocused, setIsFocused] = useState(true);
  const value = node?.data?.value ?? {};
  const pretty = (() => {
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return "{}";
    }
  })();

  function handleEditorDidMount(editor, monaco) {
    editorRef.current = editor;

    editor.onDidBlurEditorWidget(async () => {
      console.log("blurred");
      setIsFocused(false);
      let schema = null;
      try {
        const inputValue = useStore.getState().nodes.find((n) => n.id === id)
          ?.data?.value;
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

  const [title, setTitle] = useState<string>(
    String(node?.data?.label ?? "Output Data")
  );
  const [prevTitle, setPrevTitle] = useState<string>(title);
  const [editing, setEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [editing]);

  function commit(next?: string) {
    const value = (next ?? title).trim();
    const final = value.length ? value : prevTitle;
    setTitle(final);
    setPrevTitle(final);
    useStore.getState().updateNodeData(id, { label: final });
    setEditing(false);
  }

  function cancel() {
    setTitle(prevTitle);
    setEditing(false);
  }

  async function handleVisualModeChange() {
    const analysis = await analyzeJsonForVisualization(node?.data?.value ?? {});
    console.log("Analysis result:", analysis);
    const available: string[] = ["json"];
    if (analysis.isTable) available.push("table");
    if (analysis.isBarChart) available.push("bar-chart");
    if (analysis.isPieChart) available.push("pie-chart");
    setSupportedVisual(available);
    setVisualModeEnabled(analysis.success);
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
          style={{ width: 360, height: 220, resize: "both", overflow: "auto" }}
        >
          <Editor
            height="100%"
            width="100%"
            language="json"
            theme="json"
            value={pretty}
            options={{ readOnly: true }}
            onMount={handleEditorDidMount}
          />
        </div>
      </CardContent>
      <CardFooter className="p-0 px-4 pb-4 pt-0 flex items-center justify-between gap-2">
        {visualModeEnabled && (
          <Select value={visualMode} onValueChange={setVisualMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Visual mode" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="json">json</SelectItem>
              {supportedVisual.map((mode) => {
                if (mode === "json") return null;
                return (
                  <SelectItem key={mode} value={mode}>
                    {mode.replace("-", " ")}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
        )}
        <Button size="sm" onClick={handleVisualModeChange}>
          Visualize
        </Button>
      </CardFooter>
      <Handle
        type="source"
        style={{ padding: 4 }}
        position={Position.Right}
        id="json-data-node-output"
      />
      <Handle
        type="target"
        style={{ padding: 4 }}
        position={Position.Left}
        id="json-data-node-input"
      />
    </Card>
  );
}
