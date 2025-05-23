// src/store/useGraph.ts

import { create } from 'zustand';
import { Node, Edge } from '@xyflow/react';

type GraphState = {
  nodes: Node[];
  edges: Edge[];
  addNode: (node: Node) => void;
  addEdge: (edge: Edge) => void;
};

export const useGraph = create<GraphState>((set) => ({
  nodes: [],
  edges: [],
  addNode: (node) =>
    set((state) => ({ nodes: [...state.nodes, node] })),
  addEdge: (edge) =>
    set((state) => ({ edges: [...state.edges, edge] })),
}));
