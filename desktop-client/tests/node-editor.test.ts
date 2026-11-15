import { beforeEach, describe, expect, it } from 'vitest';
import {
  analyzeHookVirality,
  createDefaultPipelineEdges,
  createDefaultPipelineNodes,
  executeNodePipeline,
  useNodeGraphStore,
} from '../src/features/node-editor';

describe('Node Editor & Core Pipeline Engine (@xyflow/react)', () => {
  beforeEach(() => {
    useNodeGraphStore.getState().resetToDefaultLayout();
  });

  describe('Pipeline DAG Graph Initialization', () => {
    it('initializes default pipeline with all 11 nodes and connections', () => {
      const nodes = createDefaultPipelineNodes();
      const edges = createDefaultPipelineEdges();

      expect(nodes.length).toBe(11);
      expect(edges.length).toBeGreaterThanOrEqual(10);

      const nodeTypes = nodes.map((n) => n.type);
      expect(nodeTypes).toContain('artifactSource');
      expect(nodeTypes).toContain('scriptTemplate');
      expect(nodeTypes).toContain('hookScorer');
      expect(nodeTypes).toContain('audioTts');
      expect(nodeTypes).toContain('audioBgm');
      expect(nodeTypes).toContain('pngTuber');
      expect(nodeTypes).toContain('subtitle');
      expect(nodeTypes).toContain('safeZonePreview');
      expect(nodeTypes).toContain('visualComposite');
      expect(nodeTypes).toContain('ffmpegRender');
      expect(nodeTypes).toContain('socialPublish');
    });

    it('initializes store with valid default DAG', () => {
      const { runPipelineValidation } = useNodeGraphStore.getState();
      const validation = runPipelineValidation();

      expect(validation.isValid).toBe(true);
      expect(validation.issues).toHaveLength(0);
    });
  });

  describe('Hook Virality Scorer Heuristics', () => {
    it('awards high score (Grade S/A) to concise, curiosity-driven questions with emotional markers', () => {
      const hook = "Чому зв'язок з Opportunity обірвався саме у Солі 5111? 😱";
      const analysis = analyzeHookVirality(hook);

      expect(analysis.questionFormat).toBe(true);
      expect(analysis.curiosityGap).toBe(true);
      expect(analysis.brevityUnder12Words).toBe(true);
      expect(analysis.hasEmotionalTrigger).toBe(true);
      expect(analysis.score).toBeGreaterThanOrEqual(90);
      expect(['S', 'A']).toContain(analysis.viralGrade);
    });

    it('penalizes hooks without questions, curiosity words, or exceeding 15 words', () => {
      const boringHook =
        'Марсохід Оппортюніті працював на Марсі багато років і врешті-решт його місія завершилася тому що сонячні панелі вкрилися пилом і батареї розрядилися повністю';
      const analysis = analyzeHookVirality(boringHook);

      expect(analysis.questionFormat).toBe(false);
      expect(analysis.brevityUnder12Words).toBe(false);
      expect(analysis.score).toBeLessThanOrEqual(60);
      expect(['C', 'F']).toContain(analysis.viralGrade);
    });
  });

  describe('Zustand Node Graph Store Actions', () => {
    it('updates specific node data and preserves other nodes', () => {
      const { updateNodeData } = useNodeGraphStore.getState();

      updateNodeData('node-artifact-source', {
        artifactName: 'Curiosity Rover (MSL)',
      });

      const updated = useNodeGraphStore
        .getState()
        .nodes.find((n) => n.id === 'node-artifact-source');

      expect(updated?.data.artifactName).toBe('Curiosity Rover (MSL)');
    });

    it('automatically re-scores hookScorer node when scriptTemplate hookText changes', () => {
      const { updateNodeData } = useNodeGraphStore.getState();

      updateNodeData('node-script-template', {
        hookText: 'Шокуюча таємниця загибелі Оппортюніті: чому NASA мовчала? 🔥',
      });

      const scorerNode = useNodeGraphStore.getState().nodes.find((n) => n.type === 'hookScorer');

      expect(scorerNode?.data.curiosityGap).toBe(true);
      expect(scorerNode?.data.questionFormat).toBe(true);
      expect(scorerNode?.data.score).toBeGreaterThanOrEqual(80);
    });

    it('detects missing nodes when DAG is incomplete', () => {
      useNodeGraphStore.setState({
        nodes: useNodeGraphStore.getState().nodes.filter((n) => n.type !== 'ffmpegRender'),
      });

      const validation = useNodeGraphStore.getState().runPipelineValidation();
      expect(validation.isValid).toBe(false);
      expect(validation.issues.some((i) => i.includes('ffmpegRender'))).toBe(true);
    });
  });

  describe('Core Pipeline Execution Engine', () => {
    it('executes pipeline with default nodes and produces render result', async () => {
      const nodes = useNodeGraphStore.getState().nodes;
      const result = await executeNodePipeline(nodes, { mockDelayMs: 1 });

      expect(result.success).toBe(true);
      expect(result.renderedVideoPath).toContain('.mp4');
      expect(result.hookViralityScore).toBeGreaterThan(0);
      expect(result.totalDurationSec).toBe(40);
      expect(result.publishedChannels).toContain('youtube-shorts');
    });

    it('fails gracefully when required node is missing', async () => {
      const partialNodes = useNodeGraphStore
        .getState()
        .nodes.filter((n) => n.type !== 'artifactSource');

      const result = await executeNodePipeline(partialNodes);
      expect(result.success).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors?.[0]).toContain('artifactSource');
    });

    it('runs pipeline execution through store with progress callbacks', async () => {
      const { runPipelineExecution } = useNodeGraphStore.getState();
      const result = await runPipelineExecution();

      expect(result.success).toBe(true);
      expect(useNodeGraphStore.getState().isPipelineRunning).toBe(false);
      expect(useNodeGraphStore.getState().lastExecutionResult).toEqual(result);
    });
  });
});
