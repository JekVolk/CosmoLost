import { useArtifactStore } from '@/entities/artifact';
import {
  type RecommendNextTopicResponse,
  contentTemplateRepository,
  useContentTemplatesQuery,
} from '@/entities/content-template';
import { usePublicationStore } from '@/entities/publication';
import type { ContentLanguage, VideoScriptSlide } from '@/entities/publication';
import { useSettingsStore } from '@/entities/settings';
import { type SmmRubricType, geminiAi } from '@/shared/api';
import { useState } from 'react';

export function useScriptGenerator() {
  const defaultContentLang = useSettingsStore((s) => s.settings.contentGenerationLanguage || 'en');
  const [contentLanguage, setContentLanguage] = useState<ContentLanguage>(defaultContentLang);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<string>('last-sol-drama');
  const [nextTopicSuggestion, setNextTopicSuggestion] = useState<RecommendNextTopicResponse | null>(
    null,
  );
  const [isSyncingCatalog, setIsSyncingCatalog] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  // Magnetic Power Words & Series State
  const [magnetWord, setMagnetWord] = useState<string>('⚡ ШОК');
  const [isSeries, setIsSeries] = useState(false);
  const [seriesName, setSeriesName] = useState('Хроніки Загублених Апаратів');
  const [seriesPart, setSeriesPart] = useState(1);
  const [seriesTotalParts, setSeriesTotalParts] = useState(3);

  const { data: serverTemplates = [] } = useContentTemplatesQuery();
  const selectedArtifact = useArtifactStore((s) => s.selectedArtifact);
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const {
    currentProject,
    setCurrentProject,
    updateSlides,
    updateSeo,
    setMagnetWord: updateStoreMagnet,
    setSeriesInfo,
    setNextTopicSuggestion: updateStoreNextTopic,
    createProjectFromSuggestion,
    batchGenerateProjects,
    batchQueue,
  } = usePublicationStore();

  const loadAssetBundle = async () => {
    if (!selectedArtifactId) return;
    setIsGenerating(true);
    try {
      const bundle = await contentTemplateRepository.getAssetBundle(selectedArtifactId);
      const template = serverTemplates.find((t) => t.id === selectedRubric) || serverTemplates[0];

      const slideStructures = template?.slide_structure || [
        {
          slide_index: 1,
          type: 'HOOK' as const,
          duration_sec: 3.5,
          safe_zone_layout: 'FULLSCREEN_AVATAR',
        },
        {
          slide_index: 2,
          type: 'B_ROLL_FACTS' as const,
          duration_sec: 14.0,
          safe_zone_layout: 'CORNER_AVATAR_CENTER_3D',
        },
        {
          slide_index: 3,
          type: 'DRAMA_PEAK' as const,
          duration_sec: 16.5,
          safe_zone_layout: 'TELEMETRY_HUD_SPLIT',
        },
        {
          slide_index: 4,
          type: 'SEAMLESS_LOOP_CTA' as const,
          duration_sec: 6.0,
          safe_zone_layout: 'CTA_QR_PORTAL',
        },
      ];

      const slides: VideoScriptSlide[] = slideStructures.map((s, idx) => {
        const pngtuberState: 'IDLE' | 'EXPERT' | 'SHOCK' | 'HYPE' =
          s.type === 'HOOK'
            ? 'SHOCK'
            : s.type === 'B_ROLL_FACTS'
              ? 'EXPERT'
              : s.type === 'DRAMA_PEAK'
                ? 'HYPE'
                : 'IDLE';

        return {
          id: `slide_${idx + 1}`,
          slideIndex: s.slide_index,
          type: s.type,
          durationSec: s.duration_sec,
          narratorText:
            idx === 0
              ? bundle.seo_caption.line1_hook
              : idx === 1
                ? bundle.tts_script.uk
                : bundle.pin_comment,
          visualPrompt: `${bundle.name} ${s.safe_zone_layout}`,
          pngtuberState,
        };
      });

      const seoCaption = {
        line1Hook: bundle.seo_caption.line1_hook,
        line2Seo: bundle.seo_caption.line2_seo,
        line3Tags: bundle.seo_caption.line3_tags,
      };

      if (currentProject) {
        updateSlides(slides);
        updateSeo(seoCaption, bundle.pin_comment);
      } else {
        setCurrentProject({
          id: `proj_${Date.now().toString(36)}`,
          artifactId: selectedArtifactId,
          artifactName: bundle.name,
          rubricId: selectedRubric as SmmRubricType,
          status: 'DRAFT',
          targetDurationSec: template?.target_duration_sec || 40,
          selectionReason: 'Завантажено з офіційного медіапакету бекенду',
          slides,
          seoCaption,
          pinComment: bundle.pin_comment,
          renderTimeoutSec: 40,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      const targetSeriesInfo =
        isSeries || selectedRubric === 'chronicles'
          ? {
              seriesName,
              partNumber: seriesPart,
              totalParts: seriesTotalParts,
            }
          : undefined;

      const result = await geminiAi.generateVideoScript({
        artifactId: selectedArtifactId,
        artifactName: selectedArtifact?.name || selectedArtifactId,
        rubricId: selectedRubric as SmmRubricType,
        language: contentLanguage,
        selectionReason: currentProject?.selectionReason,
        magnetWord,
        seriesInfo: targetSeriesInfo,
      });

      const slides: VideoScriptSlide[] = result.slides.map((s, idx) => ({
        id: `slide_${idx + 1}`,
        slideIndex: s.slideIndex,
        type: s.type,
        durationSec: s.durationSec,
        narratorText: s.narratorText,
        visualPrompt: s.visualPrompt,
        pngtuberState: s.pngtuberState,
      }));

      if (currentProject) {
        updateSlides(slides);
        updateSeo(result.seoCaption, result.pinComment);
        updateStoreMagnet(magnetWord);
        if (targetSeriesInfo) {
          setSeriesInfo({
            ...targetSeriesInfo,
            cliffhanger: result.seriesInfo?.cliffhanger,
          });
        }
      } else {
        setCurrentProject({
          id: `proj_${Date.now().toString(36)}`,
          artifactId: selectedArtifactId,
          artifactName: selectedArtifact?.name || selectedArtifactId,
          rubricId: selectedRubric as SmmRubricType,
          status: 'DRAFT',
          contentLanguage,
          targetDurationSec: result.totalDurationSec,
          selectionReason: 'Річниця та драматичні деталі завершення контакту',
          magnetWord,
          seriesInfo: targetSeriesInfo
            ? { ...targetSeriesInfo, cliffhanger: result.seriesInfo?.cliffhanger }
            : undefined,
          slides,
          seoCaption: result.seoCaption,
          pinComment: result.pinComment,
          renderTimeoutSec: 40,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const suggestNextTopic = async () => {
    try {
      const resp = await contentTemplateRepository.recommendNextTopic({
        current_artifact_id: selectedArtifactId || 'spirit-rover',
        rubric_id: selectedRubric,
        selection_reason:
          currentProject?.selectionReason || 'Завершення контакту та історичні дані місії',
      });
      setNextTopicSuggestion(resp);
      updateStoreNextTopic(resp.suggested_artifact_id, resp.suggested_hook);
    } catch {
      // Fallback to local AI generator if backend fails
      const fallback = await geminiAi.recommendNextTopic({
        currentArtifactId: selectedArtifactId,
        currentRubricId: selectedRubric as SmmRubricType,
        selectionReason: currentProject?.selectionReason,
      });
      const fallbackData = {
        suggested_artifact_id: fallback.suggestedArtifactId,
        suggested_artifact_name: fallback.suggestedArtifactName,
        narrative_bridge: fallback.narrativeBridge,
        suggested_hook: fallback.suggestedHook,
        suggested_rubric_id: fallback.suggestedRubricId,
        recommended_pin_comment: fallback.recommendedPinComment,
      };
      setNextTopicSuggestion(fallbackData);
      updateStoreNextTopic(fallback.suggestedArtifactId, fallback.suggestedHook);
    }
  };

  const batchGenerate5Reels = async () => {
    setIsGenerating(true);
    try {
      const artifactsList = [
        { id: 'opportunity-rover', name: 'Opportunity Rover (MER-B)' },
        { id: 'spirit-rover', name: 'Spirit Rover (MER-A)' },
        { id: 'insight-mars-lander', name: 'InSight Mars Lander' },
        { id: 'apollo-11-lm-eagle', name: 'Apollo 11 Lunar Module (Eagle)' },
        { id: 'apollo-15-lrv-1', name: 'Apollo 15 Lunar Roving Vehicle' },
      ];
      const task = batchGenerateProjects(artifactsList, selectedRubric as SmmRubricType);
      return task;
    } finally {
      setIsGenerating(false);
    }
  };

  const triggerCatalogSync = async () => {
    setIsSyncingCatalog(true);
    setSyncStatus(null);
    try {
      const res = await contentTemplateRepository.syncNasaCatalog({
        force: false,
        dry_run: true,
      });
      setSyncStatus(`Синхронізація успішна: ${res.synced_records} записів (${res.duration_sec}с)`);
    } catch {
      setSyncStatus('Помилка виконання синхронізації каталогу');
    } finally {
      setIsSyncingCatalog(false);
    }
  };

  return {
    isGenerating,
    selectedRubric,
    setSelectedRubric,
    contentLanguage,
    setContentLanguage,
    serverTemplates,
    generateScript,
    loadAssetBundle,
    suggestNextTopic,
    nextTopicSuggestion,
    isSyncingCatalog,
    syncStatus,
    triggerCatalogSync,
    magnetWord,
    setMagnetWord,
    isSeries,
    setIsSeries,
    seriesName,
    setSeriesName,
    seriesPart,
    setSeriesPart,
    seriesTotalParts,
    setSeriesTotalParts,
    createProjectFromSuggestion,
    batchGenerate5Reels,
    batchQueue,
    currentProject,
  };
}
