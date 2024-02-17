import ReactFlow, { Background, Controls, MiniMap } from "reactflow";
import "./App.css";
import "reactflow/dist/style.css";

export default function App() {
  return (
    <ReactFlow fitView>
      <Controls />
      <MiniMap />
      <Background />
    </ReactFlow>
  );
}
