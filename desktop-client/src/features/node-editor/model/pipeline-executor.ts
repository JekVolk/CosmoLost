import { analyzeHookVirality } from './hook-scorer';
import type {
  ArtifactSourceNodeData,
  HookScorerNodeData,
  PipelineExecutionResult,
  PipelineNode,
  ScriptTemplateNodeData,
  SocialPublishNodeData,
} from './types';

export interface ExecutePipelineOptions {
  onNodeProgress?: (nodeId: string, progressPct: number, status: string) => void;
  mockDelayMs?: number;
}

export async function executeNodePipeline(
  nodes: PipelineNode[],
  options: ExecutePipelineOptions = {},
): Promise<PipelineExecutionResult> {
  const startTime = Date.now();
  const errors: string[] = [];

  const artifactNode = nodes.find((n) => n.type === 'artifactSource');
  const scriptNode = nodes.find((n) => n.type === 'scriptTemplate');
  const ffmpegNode = nodes.find((n) => n.type === 'ffmpegRender');
  const socialNode = nodes.find((n) => n.type === 'socialPublish');

  if (!artifactNode) {
    errors.push('Помилка: Не знайдено вузол джерела артефакту (artifactSource).');
  }
  if (!scriptNode) {
    errors.push('Помилка: Не знайдено вузол шаблону сценарію (scriptTemplate).');
  }
  if (!ffmpegNode) {
    errors.push('Помилка: Не знайдено вузол FFmpeg рендерингу (ffmpegRender).');
  }

  if (errors.length > 0) {
    return {
      success: false,
      hookViralityScore: 0,
      totalDurationSec: 0,
      publishedChannels: [],
      executionTimeMs: Date.now() - startTime,
      errors,
    };
  }

  const scriptData = scriptNode?.data as ScriptTemplateNodeData;
  const artifactData = artifactNode?.data as ArtifactSourceNodeData;
  const socialData = (socialNode?.data as SocialPublishNodeData) || {
    selectedChannels: ['local-folder-export'],
  };

  // 1. Analyze Hook Virality
  const hookAnalysis: HookScorerNodeData = analyzeHookVirality(
    scriptData.hookText || 'Таємниця космосу',
  );

  // 2. Simulate progressive FFmpeg rendering
  if (options.onNodeProgress && ffmpegNode) {
    options.onNodeProgress(ffmpegNode.id, 25, 'COMPILING_ASSETS');
    if (options.mockDelayMs) {
      await new Promise((r) => setTimeout(r, options.mockDelayMs));
    }

    options.onNodeProgress(ffmpegNode.id, 65, 'RENDERING_VIDEO');
    if (options.mockDelayMs) {
      await new Promise((r) => setTimeout(r, options.mockDelayMs));
    }

    options.onNodeProgress(ffmpegNode.id, 100, 'COMPLETED');
  }

  const outputPath = `C:\\Videos\\CosmoLost\\${artifactData.artifactId}_final.mp4`;

  return {
    success: true,
    renderedVideoPath: outputPath,
    hookViralityScore: hookAnalysis.score,
    totalDurationSec: scriptData.durationSec || 40,
    publishedChannels: socialData.selectedChannels || ['local-folder-export'],
    executionTimeMs: Date.now() - startTime,
  };
}
