import { useArtifactStore } from '@/entities/artifact';
import { usePublicationStore } from '@/entities/publication';
import { type NextTopicResult, type SmmRubricType, geminiAi } from '@/shared/api';
import { useState } from 'react';

export function useScriptGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedRubric, setSelectedRubric] = useState<SmmRubricType>('last-sol-drama');
  const [nextTopicSuggestion, setNextTopicSuggestion] = useState<NextTopicResult | null>(null);

  const selectedArtifact = useArtifactStore((s) => s.selectedArtifact);
  const selectedArtifactId = useArtifactStore((s) => s.selectedArtifactId);
  const { currentProject, setCurrentProject, updateSlides, updateSeo } = usePublicationStore();

  const generateScript = async () => {
    setIsGenerating(true);
    try {
      const result = await geminiAi.generateVideoScript({
        artifactId: selectedArtifactId,
        artifactName: selectedArtifact?.name || selectedArtifactId,
        rubricId: selectedRubric,
        language: 'uk',
        selectionReason: currentProject?.selectionReason,
      });

      const slides = result.slides.map((s, idx) => ({
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
      } else {
        setCurrentProject({
          id: `proj_${Date.now().toString(36)}`,
          artifactId: selectedArtifactId,
          artifactName: selectedArtifact?.name || selectedArtifactId,
          rubricId: selectedRubric,
          status: 'DRAFT',
          targetDurationSec: result.totalDurationSec,
          selectionReason: 'Річниця та драматичні деталі завершення контакту',
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
    const suggestion = await geminiAi.recommendNextTopic({
      currentArtifactId: selectedArtifactId,
      currentRubricId: selectedRubric,
      selectionReason: currentProject?.selectionReason,
    });
    setNextTopicSuggestion(suggestion);
  };

  return {
    isGenerating,
    selectedRubric,
    setSelectedRubric,
    generateScript,
    suggestNextTopic,
    nextTopicSuggestion,
  };
}
