import {
  type Connection,
  type EdgeChange,
  type NodeChange,
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
} from '@xyflow/react';
import { create } from 'zustand';
import { createDefaultPipelineEdges, createDefaultPipelineNodes } from './defaults';
import { analyzeHookVirality } from './hook-scorer';
import { executeNodePipeline } from './pipeline-executor';
import type { PipelineEdge, PipelineExecutionResult, PipelineNode } from './types';

interface NodeGraphState {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  selectedNodeId: string | null;
  isPipelineRunning: boolean;
  lastExecutionResult: PipelineExecutionResult | null;
  onNodesChange: (changes: NodeChange<PipelineNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<PipelineEdge>[]) => void;
  onConnect: (connection: Connection) => void;
  selectNode: (id: string | null) => void;
  updateNodeData: (id: string, partialData: Record<string, unknown>) => void;
  resetToDefaultLayout: () => void;
  runPipelineValidation: () => { isValid: boolean; issues: string[] };
  runPipelineExecution: () => Promise<PipelineExecutionResult>;
}

export const useNodeGraphStore = create<NodeGraphState>((set, get) => ({
  nodes: createDefaultPipelineNodes(),
  edges: createDefaultPipelineEdges(),
  selectedNodeId: null,
  isPipelineRunning: false,
  lastExecutionResult: null,

  onNodesChange: (changes) =>
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    }),

  onEdgesChange: (changes) =>
    set({
      edges: applyEdgeChanges(changes, get().edges),
    }),

  onConnect: (connection) =>
    set({
      edges: addEdge({ ...connection, animated: true }, get().edges),
    }),

  selectNode: (id) => set({ selectedNodeId: id }),

  updateNodeData: (id, partialData) => {
    let updatedNodes = get().nodes.map((node) => {
      if (node.id === id) {
        return {
          ...node,
          data: { ...node.data, ...partialData },
        } as PipelineNode;
      }
      return node;
    });

    // If script hookText was changed, automatically update HookScorer node
    if (id === 'node-script-template' && typeof partialData.hookText === 'string') {
      const hookScore = analyzeHookVirality(partialData.hookText);
      updatedNodes = updatedNodes.map((n) => {
        if (n.type === 'hookScorer') {
          return {
            ...n,
            data: { ...n.data, ...hookScore },
          } as PipelineNode;
        }
        return n;
      });
    }

    set({ nodes: updatedNodes });
  },

  resetToDefaultLayout: () =>
    set({
      nodes: createDefaultPipelineNodes(),
      edges: createDefaultPipelineEdges(),
      lastExecutionResult: null,
    }),

  runPipelineValidation: () => {
    const { nodes, edges } = get();
    const issues: string[] = [];

    // Ensure essential node types exist in DAG
    const requiredTypes = [
      'artifactSource',
      'scriptTemplate',
      'audioTts',
      'visualComposite',
      'ffmpegRender',
      'socialPublish',
    ];

    for (const reqType of requiredTypes) {
      if (!nodes.some((n) => n.type === reqType)) {
        issues.push(`Відсутня обов'язкова нода: ${reqType}`);
      }
    }

    // Verify minimum connections in DAG
    if (edges.length < 5) {
      issues.push('Граф не повністю зв’язаний: необхідно щонайменше 5 зв’язків');
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  },

  runPipelineExecution: async () => {
    const { nodes, updateNodeData } = get();
    set({ isPipelineRunning: true });

    try {
      const result = await executeNodePipeline(nodes, {
        mockDelayMs: 100,
        onNodeProgress: (nodeId, progressPct, status) => {
          updateNodeData(nodeId, {
            progressPct,
            status,
          });
        },
      });

      set({
        lastExecutionResult: result,
        isPipelineRunning: false,
      });

      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      const failResult: PipelineExecutionResult = {
        success: false,
        hookViralityScore: 0,
        totalDurationSec: 0,
        publishedChannels: [],
        executionTimeMs: 0,
        errors: [errorMsg],
      };

      set({
        lastExecutionResult: failResult,
        isPipelineRunning: false,
      });

      return failResult;
    }
  },
}));
