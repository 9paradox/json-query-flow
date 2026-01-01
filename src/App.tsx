import ReactFlow, { Background, Controls, MiniMap, Panel } from "reactflow";
import { Button } from "@/components/ui/button";
import "./App.css";
import "reactflow/dist/style.css";
import MainDataNode from "@/components/MainDataNode";
import { shallow } from "zustand/shallow";
import { useStore } from "./store";
import QueryNode from "@/components/QueryNode";
import JsonDataNode from "@/components/JsonDataNode";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
import { TypographyH4 } from "@/components/ui/h4";
import { ConnectWithAIPopover } from "@/components/ConnectWithAIPopover";

const nodeTypes = {
  mainDataNode: MainDataNode,
  queryNode: QueryNode,
  jsonDataNode: JsonDataNode,
};

const selector = (store) => ({
  nodes: store.nodes,
  edges: store.edges,
  onNodesChange: store.onNodesChange,
  onEdgesChange: store.onEdgesChange,
  addEdge: store.addEdge,
  onConnectStart: store.onConnectStart,
  onConnectEnd: store.onConnectEnd,
});

export default function App() {
  const store = useStore(selector, shallow);

  function computeFlowPositionFromEvent(event: any) {
    const pane = document.querySelector(
      ".react-flow__pane"
    ) as HTMLElement | null;
    const viewport = document.querySelector(
      ".react-flow__viewport"
    ) as HTMLElement | null;
    const rect = pane?.getBoundingClientRect() ?? { left: 0, top: 0 };
    const clientX =
      event.clientX ?? (event.touches && event.touches[0]?.clientX) ?? 0;
    const clientY =
      event.clientY ?? (event.touches && event.touches[0]?.clientY) ?? 0;

    let scale = 1;
    let tx = 0;
    let ty = 0;
    if (viewport) {
      const transform = window.getComputedStyle(viewport).transform;
      if (transform && transform !== "none") {
        const nums = transform
          .replace(/matrix3d\(|matrix\(|\)/g, "")
          .split(",")
          .map((v) => parseFloat(v.trim()));
        if (nums.length === 6) {
          scale = nums[0];
          tx = nums[4];
          ty = nums[5];
        } else if (nums.length === 16) {
          scale = nums[0];
          tx = nums[12];
          ty = nums[13];
        }
      }
    }

    const x = (clientX - rect.left - tx) / scale;
    const y = (clientY - rect.top - ty) / scale;
    return { x, y };
  }

  return (
    <ReactFlow
      nodeTypes={nodeTypes}
      nodes={store.nodes}
      edges={store.edges}
      onNodesChange={store.onNodesChange}
      onEdgesChange={store.onEdgesChange}
      onConnect={store.addEdge}
      onConnectStart={store.onConnectStart}
      onConnectEnd={(event) => {
        const pos = computeFlowPositionFromEvent(event);
        store.onConnectEnd(event, pos);
      }}
      maxZoom={1}
      fitView
    >
      <Controls />
      <MiniMap />
      <Background />

      <Panel position="top-left">
        <TypographyH4>Json Query Flow</TypographyH4>
      </Panel>

      <Panel position="top-right" className="flex items-center gap-2">
        <ConnectWithAIPopover />

        <Button
          variant="ghost"
          size="icon"
          aria-label="GitHub repository"
          asChild
          className="h-8 w-8"
        >
          <a
            href="https://github.com/9paradox/json-query-flow"
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-center"
          >
            <GitHubLogoIcon className="h-4 w-4" />
          </a>
        </Button>
      </Panel>
    </ReactFlow>
  );
}
