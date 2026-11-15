import { ChakraProvider, defaultSystem } from '@chakra-ui/react';
import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { INITIAL_DEMO_PROJECTS, usePublicationStore } from '../src/entities/publication';
import {
  GenerativeLabModal,
  buildAudioPrompt,
  buildImagePrompt,
  buildVeoPrompt,
  callGenerativeProxy,
  useGenerativeLabStore,
} from '../src/features/generative-lab';

describe('Generative Lab & Manual Override Suite (Veo, Nano Banana, Lyria, Proxy)', () => {
  beforeEach(() => {
    usePublicationStore.setState({
      currentProject: {
        ...INITIAL_DEMO_PROJECTS[0],
      },
    });
    useGenerativeLabStore.setState({
      isOpen: false,
      activeSlideIndex: 0,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('1. Prompt Builder Formatting Tests', () => {
    const mockSlide = {
      id: 's1',
      slideIndex: 1,
      type: 'HOOK' as const,
      durationSec: 3.5,
      narratorText: 'Цей марсохід розраховували на 90 днів...',
      visualPrompt: 'Mars dust storm over Perseverance Valley',
      pngtuberState: 'SHOCK' as const,
    };

    it('builds cinematic 9:16 vertical video prompt for Veo 3.1 & Google Flow', () => {
      const prompt = buildVeoPrompt(mockSlide, 'Opportunity Rover', 'last-sol-drama');
      expect(prompt).toContain('Cinematic 9:16 vertical video');
      expect(prompt).toContain('Opportunity Rover');
      expect(prompt).toContain('Mars dust storm');
      expect(prompt).toContain('Unreal Engine 5');
    });

    it('builds hyperrealistic 8K photograph prompt for Nano Banana & Imagen 3', () => {
      const prompt = buildImagePrompt(mockSlide, 'Opportunity Rover');
      expect(prompt).toContain('Hyperrealistic 8K NASA archival photograph');
      expect(prompt).toContain('Hasselblad medium format');
      expect(prompt).toContain('Opportunity Rover');
    });

    it('builds musical vibe prompt for Lyria audio score', () => {
      const prompt = buildAudioPrompt(mockSlide, 'last-sol-drama');
      expect(prompt).toContain('BPM');
      expect(prompt).toContain('synth');
    });
  });

  describe('2. Slide Custom Media & Store Injection', () => {
    it('updates slide with custom video asset and verifies persistence', () => {
      const store = usePublicationStore.getState();
      const firstSlide = store.currentProject?.slides[0];
      expect(firstSlide).toBeDefined();

      if (firstSlide) {
        store.updateSlideMedia(
          firstSlide.id,
          'https://cdn.cosmolost.space/veo_opportunity_sol5111.mp4',
          'video',
        );
      }

      const updatedSlide = usePublicationStore.getState().currentProject?.slides[0];
      expect(updatedSlide?.customMediaUrl).toBe(
        'https://cdn.cosmolost.space/veo_opportunity_sol5111.mp4',
      );
      expect(updatedSlide?.customMediaType).toBe('video');
    });

    it('updates slide with custom prompt and clears custom media', () => {
      const store = usePublicationStore.getState();
      const firstSlide = store.currentProject?.slides[0];
      expect(firstSlide).toBeDefined();

      if (firstSlide) {
        store.updateSlidePrompt(firstSlide.id, 'veoPrompt', 'Custom refined Veo prompt');
        store.clearSlideMedia(firstSlide.id);
      }

      const updated = usePublicationStore.getState().currentProject?.slides[0];
      expect(updated?.veoPrompt).toBe('Custom refined Veo prompt');
      expect(updated?.customMediaUrl).toBeUndefined();
    });
  });

  describe('3. Local Generative Proxy Client Fault Tolerance', () => {
    it('returns graceful fallback message when proxy server is unreachable', async () => {
      const result = await callGenerativeProxy({
        endpoint: 'http://127.0.0.1:9999/v1',
        prompt: 'Mars sunset test',
        modality: 'image',
        timeoutMs: 500,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Не вдалося підключитися до проксі');
    });
  });

  describe('4. GenerativeLabModal UI Interactive Flow', () => {
    it('renders modal with slide tabs, prompt textareas, and copy buttons', async () => {
      useGenerativeLabStore.setState({ isOpen: true, activeSlideIndex: 0 });

      // Mock navigator.clipboard
      const writeTextMock = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, 'clipboard', {
        value: {
          writeText: writeTextMock,
        },
        writable: true,
        configurable: true,
      });

      render(
        <ChakraProvider value={defaultSystem}>
          <GenerativeLabModal />
        </ChakraProvider>,
      );

      // Verify modal header and badges
      expect(screen.getByText(/Лабораторія ШІ-Генерації та Інспекції Фрагментів/i)).toBeDefined();
      expect(screen.getByText(/DEV BYOK/i)).toBeDefined();

      // Check modality sections
      expect(screen.getByText(/🎬 Відео Промпт \(Google Flow \/ Veo 3.1, 9:16\)/i)).toBeDefined();
      expect(
        screen.getByText(/🎨 Фото Промпт \(Nano Banana 2 \/ Gemini Image, 8K\)/i),
      ).toBeDefined();
      expect(screen.getByText(/🎵 Музичний Саундтрек \(Lyria Audio Vibe\)/i)).toBeDefined();

      // Click copy Veo button
      const copyVeoBtn = screen.getByRole('button', { name: /Копіювати Veo/i });
      fireEvent.click(copyVeoBtn);
      expect(writeTextMock).toHaveBeenCalled();
    });
  });
});
