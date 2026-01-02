import React from "react";
import ReactDOM from "react-dom/client";
import { ReactFlowProvider } from "reactflow";
import { Toaster } from "@/components/ui/sonner";
import App from "./App.tsx";
import "reactflow/dist/style.css";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <div style={{ width: "100vw", height: "100vh" }}>
      <ReactFlowProvider>
        <App />
      </ReactFlowProvider>
    </div>
    <Toaster />
  </React.StrictMode>
);
