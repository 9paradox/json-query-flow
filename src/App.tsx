import ReactFlow, { Background, Controls, MiniMap, Panel } from "reactflow";
import { Button } from "@/components/ui/button"
import "./App.css";
import "reactflow/dist/style.css";

export default function App() {
  return (
    <ReactFlow fitView>
      <Controls />
      <MiniMap />
      <Background />
      <Panel position="top-right">
        <Button> Add </Button>
      </Panel>
    </ReactFlow>
  );
}
