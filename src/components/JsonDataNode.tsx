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
import { RefreshCcw, TrashIcon } from "lucide-react";
import { jsonToSchemaLite } from "@/lib/jsonToSchemaLite";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import JsonTable from "@/components/JsonTable";

import {
  analyzeJsonForVisualization,
  AnalyzerResult,
  Aggregation,
  AGGREGATION_OPTIONS,
  getAggregation,
} from "@/lib/analyzeJsonForVisualization";
import { BarChartView } from "@/components/BarChartView";
import { PieChartView } from "@/components/PieChartView";

export default function JsonDataNode({ id }: NodeProps) {
  const node = useStore((s) => s.nodes.find((n) => n.id === id));
  const [visualModeEnabled, setVisualModeEnabled] = useState<boolean>(false);
  const [visualMode, setVisualMode] = useState<string>("json");
  const [aggregationType, setAggregationType] = useState<Aggregation>("auto");
  const [analyzerResult, setAnalyzerResult] = useState<AnalyzerResult | null>(
    null
  );
  const editorRef = useRef(null);
  const [, setIsFocused] = useState(true);
  const [title, setTitle] = useState<string>(
    String(node?.data?.nodeLabel ?? "Output Data")
  );
  const [prevTitle, setPrevTitle] = useState<string>(title);
  const [editing, setEditing] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
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
      setIsFocused(true);
    });
  }

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
    const analysis = await analyzeJsonForVisualization(
      node?.data?.jsonData ?? {}
    );
    console.log("Analysis result:", analysis);
    setAnalyzerResult(analysis);
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
              className="text-base font-semibold bg-transparent border border-input rounded px-2 py-1
                     focus:outline-none focus:ring-2 focus:ring-ring
                     focus:ring-offset-2 focus:ring-offset-background"
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
          aria-label="Visualization output"
          tabIndex={0}
          className="w-[360px] h-[220px] resize both overflow-auto rounded-md border
                 focus:outline-none focus:ring-2 focus:ring-ring
                 focus:ring-offset-2 focus:ring-offset-background"
        >
          {visualMode === "json" && (
            <Editor
              height="100%"
              width="100%"
              language="json"
              theme="json"
              value={pretty}
              options={{ readOnly: true, accessibilitySupport: "on" }}
              onMount={handleEditorDidMount}
            />
          )}

          {visualMode === "table" && <JsonTable data={value} />}

          {visualMode === "bar" && (
            <BarChartView
              data={analyzerResult.chartData?.bar}
              aggregation={aggregationType}
            />
          )}

          {visualMode === "pie" && (
            <PieChartView
              data={analyzerResult.chartData?.pie}
              aggregation={aggregationType}
            />
          )}
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between gap-2 px-4 pb-4 pt-0">
        <div className="flex items-center gap-2">
          {visualModeEnabled && (
            <Select value={visualMode} onValueChange={setVisualMode}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Visual mode" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="json">json</SelectItem>
                {analyzerResult.availableViews.map((mode) =>
                  mode === "json" ? null : (
                    <SelectItem key={mode} value={mode}>
                      {mode}
                    </SelectItem>
                  )
                )}
              </SelectContent>
            </Select>
          )}

          {visualModeEnabled &&
            (visualMode === "bar" || visualMode === "pie") && (
              <Select
                value={aggregationType}
                onValueChange={(a) => {
                  const aggregationType = getAggregation(a, "auto");
                  setAggregationType(aggregationType);
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Aggregation type" />
                </SelectTrigger>
                <SelectContent>
                  {AGGREGATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={handleVisualModeChange}
          className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium"
        >
          {visualModeEnabled && (
            <RefreshCcw className="h-4 w-4 text-muted-foreground" />
          )}
          <span>Visualize</span>
        </Button>
      </CardFooter>

      <Handle
        type="source"
        position={Position.Right}
        id="json-data-node-output"
        style={{ padding: 4 }}
      />
      <Handle
        type="target"
        position={Position.Left}
        id="json-data-node-input"
        style={{ padding: 4 }}
      />
    </Card>
  );
}
