import {
  applyNodeChanges,
  applyEdgeChanges,
  Node,
  Edge,
  Connection,
  NodeChange,
  EdgeChange,
} from "reactflow";
import { nanoid } from "nanoid";
import { create } from "zustand";
import jsonata from "jsonata";
import { jsonToSchemaLite } from "@/lib/jsonToSchemaLite";

const ALLOW_OUT: Record<string, string[]> = {
  mainDataNode: ["queryNode"],
  jsonDataNode: ["queryNode"],
  queryNode: ["jsonDataNode"],
};

// const ALLOW_IN: Record<string, string[]> = Object.entries(ALLOW_OUT).reduce(
//   (acc, [src, targets]) => {
//     for (const tgt of targets) {
//       (acc[tgt] ||= []).push(src);
//     }
//     return acc;
//   },
//   {} as Record<string, string[]>
// );

const ALLOWED_SOURCE_HANDLES: Record<string, string[]> = {
  mainDataNode: ["data-node-handle"],
  jsonDataNode: ["json-data-node-handle"],
  queryNode: ["data-node-handle"],
};
const REQUIRED_TARGET_HANDLE: Record<string, string> = {
  queryNode: "query-target",
  jsonDataNode: "json-data-node-target",
};

interface StoreState {
  nodes: Node[];
  edges: Edge[];
  connectStart: { nodeId: string | null; handleId?: string | null } | null;

  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;

  onConnectStart: (event: any, params?: any) => void;
  onConnectEnd: (
    event: any,
    position?: { x: number; y: number } | null
  ) => void;

  addEdge: (data: Connection & { position?: { x: number; y: number } }) => void;
  removeNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, patch: any) => void;
  runQueryNode: (nodeId: string) => Promise<void>;
}

export const useStore = create<StoreState>((set, get) => {
  const findNode = (id?: string | null) =>
    get().nodes.find((n) => n.id === String(id));

  const canConnect = (source?: Node, target?: Node) => {
    if (!source || !target) return false;
    const allowed = ALLOW_OUT[String(source.type)] || [];
    return allowed.includes(String(target.type));
  };

  const sourceHandleAllowed = (node?: Node, sourceHandle?: string | null) => {
    if (!node || !sourceHandle) return true;
    const allowed = ALLOWED_SOURCE_HANDLES[String(node.type)] || [];
    return allowed.includes(String(sourceHandle));
  };

  const targetHandleAllowed = (node?: Node, targetHandle?: string | null) => {
    if (!node || !targetHandle) return true;
    const required = REQUIRED_TARGET_HANDLE[String(node.type)];
    return required ? required === String(targetHandle) : true;
  };

  const computeNewPos = (
    source: Node | undefined,
    fallback?: { x: number; y: number }
  ) => {
    const sourcePos: any = (source && (source.position as any)) || {
      x: 0,
      y: 0,
    };
    return fallback ?? { x: sourcePos.x + 200, y: sourcePos.y };
  };

  const createQueryNodeAt = (pos: { x: number; y: number }): Node => ({
    id: `query-${nanoid(6)}`,
    type: "queryNode",
    data: { label: "New Query Node", query: "$" },
    position: pos,
  });

  const createJsonDataNodeAt = (pos: { x: number; y: number }): Node => ({
    id: `json-data-${nanoid(6)}`,
    type: "jsonDataNode",
    data: { label: "New Data Node", value: {} },
    position: pos,
  });

  const addEdgeSafe = (edges: Edge[], edge: Edge) => {
    if (edges.some((e) => e.id === edge.id)) return edges;
    return [...edges, edge];
  };

  return {
    nodes: [
      {
        id: "mainDataNode",
        type: "mainDataNode",
        data: {
          label: "Main Data",
          value: {
            example: "Hi! welcome to Json Query Flow",
            action: "Drag the edge to start writing queries",
          },
          schema: null,
        },
        position: { x: 0, y: 0 },
      },
    ],
    edges: [],
    connectStart: null,

    onNodesChange(changes) {
      set({ nodes: applyNodeChanges(changes, get().nodes) });
    },

    onEdgesChange(changes) {
      set({ edges: applyEdgeChanges(changes, get().edges) });
    },

    onConnectStart(_event, params) {
      set({
        connectStart: {
          nodeId: params?.nodeId ?? null,
          handleId: params?.handleId ?? null,
        },
      });
    },

    onConnectEnd(event, position = null) {
      const cs = get().connectStart;
      const target = event?.target as HTMLElement | null;
      const endedOnPane = !!(
        target &&
        (target.classList?.contains("react-flow__pane") ||
          (target.closest && target.closest(".react-flow__pane")))
      );
      if (endedOnPane && cs?.nodeId) {
        get().addEdge({
          source: cs.nodeId,
          sourceHandle: cs.handleId,
          position: position ?? undefined,
        } as any);
      }
      set({ connectStart: null });
    },

    addEdge(data) {
      const nodes = get().nodes;
      let edges = get().edges;

      const sourceNode = findNode(data.source);
      const targetNode = data.target
        ? findNode(String(data.target))
        : undefined;

      if (sourceNode && targetNode) {
        if (
          canConnect(sourceNode, targetNode) &&
          sourceHandleAllowed(sourceNode, data.sourceHandle as any) &&
          targetHandleAllowed(targetNode, data.targetHandle as any)
        ) {
          const id = nanoid(6);
          set({ edges: [...edges, { ...data, id }] });
        }
        return;
      }

      if (
        sourceNode &&
        (sourceNode.type === "mainDataNode" ||
          sourceNode.type === "jsonDataNode")
      ) {
        const pos = computeNewPos(sourceNode, (data as any).position);
        const newNode = createQueryNodeAt(pos);
        const newNodes = [...nodes, newNode];

        const e1: Edge = {
          id: `e-${nanoid(6)}`,
          source: String(data.source),
          target: newNode.id,
        };

        if (!canConnect(sourceNode, newNode)) {
          set({ nodes: newNodes, edges });
          return;
        }

        edges = addEdgeSafe(edges, e1);

        if (targetNode && canConnect(newNode, targetNode)) {
          const e2: Edge = {
            id: `e-${nanoid(6)}`,
            source: newNode.id,
            target: String(data.target),
          };
          edges = addEdgeSafe(edges, e2);
        }

        set({ nodes: newNodes, edges });
        return;
      }

      if (sourceNode && sourceNode.type === "queryNode") {
        const pos = computeNewPos(sourceNode, (data as any).position);
        const newNode = createJsonDataNodeAt(pos);
        const newNodes = [...nodes, newNode];

        const e1: Edge = {
          id: `e-${nanoid(6)}`,
          source: String(data.source),
          target: newNode.id,
        };

        if (!canConnect(sourceNode, newNode)) {
          set({ nodes: newNodes, edges });
          return;
        }

        edges = addEdgeSafe(edges, e1);

        if (targetNode && canConnect(newNode, targetNode)) {
          const e2: Edge = {
            id: `e-${nanoid(6)}`,
            source: newNode.id,
            target: String(data.target),
          };
          edges = addEdgeSafe(edges, e2);
        }

        set({ nodes: newNodes, edges });
        return;
      }
    },

    removeNode(nodeId) {
      const nodes = get().nodes.filter((n) => n.id !== nodeId);
      const edges = get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId
      );
      set({ nodes, edges });
    },

    updateNodeData(nodeId, patch) {
      const nodes = get().nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...(n.data || {}), ...patch } } : n
      );
      set({ nodes });
    },

    async runQueryNode(nodeId) {
      let nodes = get().nodes;
      let edges = get().edges;

      const queryNode = findNode(nodeId);
      if (!queryNode || queryNode.type !== "queryNode") return;

      let targets = edges
        .filter((e) => e.source === nodeId)
        .map((e) => findNode(e.target))
        .filter((n): n is Node => !!n && n.type === "jsonDataNode");

      if (targets.length === 0) {
        const newNode = createJsonDataNodeAt(computeNewPos(queryNode));
        const e: Edge = {
          id: `e-${nanoid(6)}`,
          source: nodeId,
          target: newNode.id,
        };
        nodes = [...nodes, newNode];
        edges = addEdgeSafe(edges, e);
        targets = [newNode];
      }

      const upstream = edges
        .filter((e) => e.target === nodeId)
        .map((e) => findNode(e.source))
        .find(
          (n) => n && (n.type === "mainDataNode" || n.type === "jsonDataNode")
        );

      const inputData =
        (upstream as any)?.data?.value ?? (upstream as any)?.data ?? {};
      const queryStr = (queryNode.data as any)?.query || "$";

      let result: any;
      try {
        let schema = upstream ? (upstream as any)?.data?.schema || null : null;

        if (schema === null && inputData) {
          try {
            schema = jsonToSchemaLite(inputData);
          } catch {
            schema = null;
            console.log("Failed to compute schema");
          }
        }

        console.log("Using schema:", schema); // --- IGNORE ---
        result = await jsonata(queryStr).evaluate(inputData);
      } catch (err: any) {
        result = { error: String(err?.message || err) };
      }

      const targetIds = new Set(targets.map((t) => t.id));
      const updatedNodes = nodes.map((n) =>
        targetIds.has(n.id)
          ? {
              ...n,
              data: { ...(n.data || {}), value: result, label: "Result" },
            }
          : n
      );

      set({ nodes: updatedNodes, edges });
    },
  };
});
