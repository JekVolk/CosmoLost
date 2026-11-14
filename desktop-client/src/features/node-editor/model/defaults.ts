import { analyzeHookVirality } from './hook-scorer';
import type { PipelineEdge, PipelineNode } from './types';

export function createDefaultPipelineNodes(): PipelineNode[] {
  const initialHook = "Чому зв'язок з Opportunity обірвався саме у Солі 5111? 😱";
  const hookAnalysis = analyzeHookVirality(initialHook);

  return [
    {
      id: 'node-artifact-source',
      type: 'artifactSource',
      position: { x: 50, y: 180 },
      data: {
        celestialBody: 'mars',
        artifactId: 'opportunity-rover',
        artifactName: 'Opportunity Rover (MER-B)',
        has3dModel: true,
        photosCount: 2,
      },
    },
    {
      id: 'node-script-template',
      type: 'scriptTemplate',
      position: { x: 380, y: 180 },
      data: {
        rubricId: 'last-sol-drama',
        durationSec: 40,
        slidesCount: 4,
        hookText: initialHook,
        loopCtaText: 'Але його наукова спадщина змінила все. А ти знав...',
      },
    },
    {
      id: 'node-hook-scorer',
      type: 'hookScorer',
      position: { x: 720, y: 40 },
      data: hookAnalysis,
    },
    {
      id: 'node-audio-tts',
      type: 'audioTts',
      position: { x: 720, y: 280 },
      data: {
        voice: 'uk-UA-OstapNeural',
        speedRate: 1.1,
        enableJumpCut: true,
        audioDurationSec: 38.5,
        rmsSampleCount: 770,
      },
    },
    {
      id: 'node-audio-bgm',
      type: 'audioBgm',
      position: { x: 720, y: 520 },
      data: {
        trackTitle: 'Mars Dust Storm Odyssey',
        genre: 'synthwave',
        duckingDb: -14,
        bgmVolumePct: 22,
        duckingAttackMs: 120,
      },
    },
    {
      id: 'node-subtitle',
      type: 'subtitle',
      position: { x: 1060, y: 60 },
      data: {
        format: 'ASS',
        highlightColor: '#FFD700',
        wordsPerChunk: 3,
      },
    },
    {
      id: 'node-pngtuber',
      type: 'pngTuber',
      position: { x: 1060, y: 280 },
      data: {
        modelName: 'AstroCat Operator',
        activeExpression: 'shock',
        rmsThreshold: 0.015,
        bounceEnabled: true,
        anchorPosition: 'bottom-right',
      },
    },
    {
      id: 'node-safezone-preview',
      type: 'safeZonePreview',
      position: { x: 1060, y: 500 },
      data: {
        preset: 'youtube-shorts',
        topMarginPx: 220,
        bottomMarginPx: 420,
        rightMarginPx: 150,
        isSubtitleSafe: true,
        isAvatarSafe: true,
      },
    },
    {
      id: 'node-visual-composite',
      type: 'visualComposite',
      position: { x: 1400, y: 240 },
      data: {
        enablePillowBox: true,
        enableKenBurns: true,
        enablePngTuber: true,
        pngtuberState: 'SHOCK',
        enableSafeZonesOverlay: true,
      },
    },
    {
      id: 'node-ffmpeg-render',
      type: 'ffmpegRender',
      position: { x: 1740, y: 240 },
      data: {
        renderTimeoutSec: 40,
        fps: 60,
        qualityCrf: 20,
        progressPct: 100,
        status: 'COMPLETED',
        outputPath: 'C:\\Videos\\CosmoLost\\opportunity-rover_rendered.mp4',
      },
    },
    {
      id: 'node-social-publish',
      type: 'socialPublish',
      position: { x: 2080, y: 240 },
      data: {
        selectedChannels: ['youtube-shorts', 'telegram-channel', 'local-folder-export'],
        line1Hook: 'Останній день марсохода Opportunity 😱👇',
        line2Seo: 'Повна історія та розбір останньої телеметрії. cosmolost.lihtar.org',
        line3Tags: '#space #nasa #mars #opportunity',
        pinComment: 'Як ви вважаєте, чи варто забрати Opportunity на Землю?',
      },
    },
  ];
}

export function createDefaultPipelineEdges(): PipelineEdge[] {
  return [
    {
      id: 'edge-1-2',
      source: 'node-artifact-source',
      target: 'node-script-template',
      animated: true,
    },
    {
      id: 'edge-2-scorer',
      source: 'node-script-template',
      target: 'node-hook-scorer',
      animated: true,
    },
    {
      id: 'edge-2-3',
      source: 'node-script-template',
      target: 'node-audio-tts',
      animated: true,
    },
    {
      id: 'edge-3-sub',
      source: 'node-audio-tts',
      target: 'node-subtitle',
      animated: true,
    },
    {
      id: 'edge-3-png',
      source: 'node-audio-tts',
      target: 'node-pngtuber',
      animated: true,
    },
    {
      id: 'edge-bgm-composite',
      source: 'node-audio-bgm',
      target: 'node-visual-composite',
      animated: true,
    },
    {
      id: 'edge-sub-composite',
      source: 'node-subtitle',
      target: 'node-visual-composite',
      animated: true,
    },
    {
      id: 'edge-png-composite',
      source: 'node-pngtuber',
      target: 'node-visual-composite',
      animated: true,
    },
    {
      id: 'edge-composite-safezone',
      source: 'node-visual-composite',
      target: 'node-safezone-preview',
      animated: true,
    },
    {
      id: 'edge-safezone-render',
      source: 'node-safezone-preview',
      target: 'node-ffmpeg-render',
      animated: true,
    },
    {
      id: 'edge-render-publish',
      source: 'node-ffmpeg-render',
      target: 'node-social-publish',
      animated: true,
    },
  ];
}
