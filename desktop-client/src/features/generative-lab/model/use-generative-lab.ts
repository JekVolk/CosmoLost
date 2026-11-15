import { usePublicationStore } from '@/entities/publication';
import { useSettingsStore } from '@/entities/settings';
import { useState } from 'react';
import { create } from 'zustand';
import { buildAudioPrompt, buildImagePrompt, buildVeoPrompt } from './prompt-builder';
import { callGenerativeProxy } from './proxy-client';
import type { GenerativeModality } from './types';

interface GenerativeLabStore {
  isOpen: boolean;
  activeSlideIndex: number;
  openModal: (slideIndex?: number) => void;
  closeModal: () => void;
  setActiveSlideIndex: (index: number) => void;
}

export const useGenerativeLabStore = create<GenerativeLabStore>((set) => ({
  isOpen: false,
  activeSlideIndex: 0,
  openModal: (slideIndex = 0) => set({ isOpen: true, activeSlideIndex: slideIndex }),
  closeModal: () => set({ isOpen: false }),
  setActiveSlideIndex: (index) => set({ activeSlideIndex: index }),
}));

export function useGenerativeLab() {
  const { isOpen, activeSlideIndex, openModal, closeModal, setActiveSlideIndex } =
    useGenerativeLabStore();
  const currentProject = usePublicationStore((s) => s.currentProject);
  const updateSlideMedia = usePublicationStore((s) => s.updateSlideMedia);
  const updateSlidePrompt = usePublicationStore((s) => s.updateSlidePrompt);
  const clearSlideMedia = usePublicationStore((s) => s.clearSlideMedia);

  const proxyEndpoint = useSettingsStore(
    (s) => s.settings.generativeProxyEndpoint || 'http://localhost:8000/v1',
  );
  const proxyToken = useSettingsStore((s) => s.settings.generativeProxyAuthToken || '');

  const [copiedModality, setCopiedModality] = useState<GenerativeModality | null>(null);
  const [isGeneratingProxy, setIsGeneratingProxy] = useState(false);
  const [proxyStatusFeedback, setProxyStatusFeedback] = useState<string | null>(null);

  const slides = currentProject?.slides || [];
  const currentSlide = slides[activeSlideIndex] || slides[0];
  const artifactName = currentProject?.artifactName || 'CosmoLost Discovery';
  const rubricId = currentProject?.rubricId;

  const currentVeoPrompt = currentSlide ? buildVeoPrompt(currentSlide, artifactName, rubricId) : '';
  const currentImagePrompt = currentSlide ? buildImagePrompt(currentSlide, artifactName) : '';
  const currentAudioPrompt = currentSlide ? buildAudioPrompt(currentSlide, rubricId) : '';
  const currentNarratorText = currentSlide?.narratorText || '';

  const copyPrompt = async (modality: GenerativeModality, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedModality(modality);
      setTimeout(() => setCopiedModality(null), 2500);
    } catch {
      // Fallback
    }
  };

  const setManualMedia = (url: string, mediaType: 'video' | 'image') => {
    if (!currentSlide) return;
    updateSlideMedia(currentSlide.id, url, mediaType);
  };

  const handleFileUpload = (file: File) => {
    if (!currentSlide) return;
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name);
    const mediaType: 'video' | 'image' = isVideo ? 'video' : 'image';

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      if (dataUrl) {
        updateSlideMedia(currentSlide.id, dataUrl, mediaType);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeMedia = () => {
    if (!currentSlide) return;
    clearSlideMedia(currentSlide.id);
  };

  const runProxyGeneration = async (modality: 'image' | 'video') => {
    if (!currentSlide) return;
    setIsGeneratingProxy(true);
    setProxyStatusFeedback(null);

    const prompt = modality === 'video' ? currentVeoPrompt : currentImagePrompt;
    try {
      const result = await callGenerativeProxy({
        endpoint: proxyEndpoint,
        token: proxyToken,
        prompt,
        modality,
      });

      if (result.success && result.mediaUrl) {
        updateSlideMedia(currentSlide.id, result.mediaUrl, result.mediaType);
        setProxyStatusFeedback(`✓ Успішно згенеровано через ${result.source}!`);
      } else {
        setProxyStatusFeedback(`⚠️ ${result.error || 'Помилка генерації через проксі.'}`);
      }
    } finally {
      setIsGeneratingProxy(false);
      setTimeout(() => setProxyStatusFeedback(null), 6000);
    }
  };

  return {
    isOpen,
    openModal,
    closeModal,
    activeSlideIndex,
    setActiveSlideIndex,
    slides,
    currentSlide,
    artifactName,
    currentVeoPrompt,
    currentImagePrompt,
    currentAudioPrompt,
    currentNarratorText,
    copiedModality,
    copyPrompt,
    setManualMedia,
    handleFileUpload,
    removeMedia,
    runProxyGeneration,
    isGeneratingProxy,
    proxyStatusFeedback,
    proxyEndpoint,
    updateSlidePrompt,
  };
}
