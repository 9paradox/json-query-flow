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
import { jsonToSchemaLite, SchemaLite } from "@/lib/jsonToSchemaLite";

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

export interface FlowNode {
  jsonData: unknown | null;
  nodeLabel: string;
  jsonSchema: unknown | null;
  jsonQuery: string;
  nlQuery: string;
  isLoading?: boolean;
}

interface StoreState {
  nodes: Node<FlowNode>[];
  edges: Edge[];
  connectStart: { nodeId: string | null; handleId?: string | null } | null;
  apiKey?: string;

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
  generateJsonSchemaForNode: (nodeId: string) => Promise<SchemaLite>;
  setApiKey: (key: string) => void;
}

export const useStore = create<StoreState>((set, get) => {
  const findNode = (id?: string | null) =>
    get().nodes.find((n) => n.id === String(id));

  const canConnect = (source?: Node<FlowNode>, target?: Node<FlowNode>) => {
    if (!source || !target) return false;
    const allowed = ALLOW_OUT[String(source.type)] || [];
    return allowed.includes(String(target.type));
  };

  const sourceHandleAllowed = (
    node?: Node<FlowNode>,
    sourceHandle?: string | null
  ) => {
    if (!node || !sourceHandle) return true;
    const allowed = ALLOWED_SOURCE_HANDLES[String(node.type)] || [];
    return allowed.includes(String(sourceHandle));
  };

  const targetHandleAllowed = (
    node?: Node<FlowNode>,
    targetHandle?: string | null
  ) => {
    if (!node || !targetHandle) return true;
    const required = REQUIRED_TARGET_HANDLE[String(node.type)];
    return required ? required === String(targetHandle) : true;
  };

  const computeNewPos = (
    source: Node<FlowNode> | undefined,
    fallback?: { x: number; y: number }
  ) => {
    const sourcePos: any = (source && (source.position as any)) || {
      x: 0,
      y: 0,
    };
    return (
      fallback ?? {
        x: sourcePos.x + (source.width ?? 400),
        y: sourcePos.y + (source.height ?? 100),
      }
    );
  };

  const createQueryNodeAt = (pos: {
    x: number;
    y: number;
  }): Node<FlowNode> => ({
    id: `query-${nanoid(6)}`,
    type: "queryNode",
    data: {
      jsonData: {},
      nodeLabel: "New Query Node",
      jsonSchema: null,
      jsonQuery: "$",
      nlQuery: "",
      isLoading: false,
    },
    position: pos,
  });

  const createJsonDataNodeAt = (pos: {
    x: number;
    y: number;
  }): Node<FlowNode> => ({
    id: `json-data-${nanoid(6)}`,
    type: "jsonDataNode",
    data: {
      jsonData: {},
      nodeLabel: "New Data Node",
      jsonSchema: null,
      jsonQuery: "$",
      nlQuery: "",
      isLoading: false,
    },
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
          jsonData: {
            example: "Hi! welcome to Json Query Flow",
            action: "Drag the edge to start writing queries",
          },
          nodeLabel: "Main Data",
          jsonSchema: null,
          jsonQuery: "$",
          nlQuery: "",
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
          sourceHandleAllowed(sourceNode, data.sourceHandle) &&
          targetHandleAllowed(targetNode, data.targetHandle)
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
        const pos = computeNewPos(sourceNode, data.position);
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
        const pos = computeNewPos(sourceNode, data.position);
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
      this.updateNodeData(nodeId, { isLoading: true });
      let nodes = get().nodes;
      let edges = get().edges;

      const queryNode = findNode(nodeId);
      if (!queryNode || queryNode.type !== "queryNode") return;

      let targets = edges
        .filter((e) => e.source === nodeId)
        .map((e) => findNode(e.target))
        .filter((n): n is Node<FlowNode> => !!n && n.type === "jsonDataNode");

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

      const inputData = upstream?.data?.jsonData ?? {};
      const queryStr = queryNode.data?.jsonQuery || "$";

      let result: any;
      try {
        let schema = upstream ? upstream?.data?.jsonSchema || null : null;

        if (schema === null && inputData) {
          try {
            schema = jsonToSchemaLite(inputData);
            console.log("Computed schema for node", upstream?.id, schema);
          } catch {
            schema = null;
            console.log("Failed to compute schema");
          }
        }
        result = await jsonata(queryStr).evaluate(inputData);
      } catch (err: any) {
        result = { error: String(err?.message || err) };
      }

      const targetIds = new Set(targets.map((t) => t.id));
      const updatedNodes = nodes.map((n) =>
        targetIds.has(n.id)
          ? ({
              ...n,
              data: {
                ...(n.data || {}),
                jsonData: result,
                jsonSchema: n.data?.jsonSchema,
              },

              //data: { ...(n.data || {}), value: result, label: "Result" },
            } as Node<FlowNode>)
          : n
      );

      set({ nodes: updatedNodes, edges });

      this.updateNodeData(nodeId, { isLoading: false });
    },
    async generateJsonSchemaForNode(nodeId: string): Promise<SchemaLite> {
      const node = findNode(nodeId);
      if (!node) throw new Error("Node not found");

      const jsonData = node.data?.jsonData || {};
      const schema = jsonToSchemaLite(jsonData);

      this.updateNodeData(nodeId, { jsonSchema: schema });
      return schema;
    },
    setApiKey(key: string) {
      set({ apiKey: key });
    },
  };
});
