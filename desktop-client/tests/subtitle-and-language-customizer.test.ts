import { beforeEach, describe, expect, it } from 'vitest';
import { DEFAULT_SUBTITLE_STYLE, usePublicationStore } from '../src/entities/publication';
import { useSettingsStore } from '../src/entities/settings';
import {
  SUBTITLE_PRESETS,
  buildAssOverrideHeader,
  chunkSentence,
  tokenizeChunk,
} from '../src/features/media-engine';
import { geminiAi } from '../src/shared/api';

describe('Contrast Subtitles & Video Generation Language Configuration', () => {
  beforeEach(() => {
    useSettingsStore.setState({
      settings: {
        ...useSettingsStore.getState().settings,
        contentGenerationLanguage: 'en',
      },
    });

    usePublicationStore.setState({
      currentProject: {
        id: 'proj-subtitle-test',
        artifactId: 'perseverance-rover',
        artifactName: 'Perseverance Rover',
        rubricId: 'last-sol-drama',
        status: 'DRAFT',
        contentLanguage: 'en',
        subtitleStyle: DEFAULT_SUBTITLE_STYLE,
        targetDurationSec: 40,
        selectionReason: 'Sample collection',
        slides: [],
        seoCaption: {
          line1Hook: 'Why did Perseverance go silent?',
          line2Seo: 'NASA Mars exploration',
          line3Tags: '#NASA #Mars',
        },
        pinComment: 'Discussion comment',
        renderTimeoutSec: 40,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    });
  });

  describe('1. Subtitle Contrast Presets & Styling Logic', () => {
    it('defines Hormozi Yellow, MrBeast Cyan, Cyber Lime, and Clean White presets', () => {
      expect(SUBTITLE_PRESETS.HORMOZI_YELLOW).toBeDefined();
      expect(SUBTITLE_PRESETS.HORMOZI_YELLOW.highlightColor).toBe('#facc15');
      expect(SUBTITLE_PRESETS.HORMOZI_YELLOW.isUppercase).toBe(true);

      expect(SUBTITLE_PRESETS.MRBEAST_CYAN).toBeDefined();
      expect(SUBTITLE_PRESETS.MRBEAST_CYAN.highlightColor).toBe('#22d3ee');
      expect(SUBTITLE_PRESETS.MRBEAST_CYAN.strokeWidth).toBe(3);

      expect(SUBTITLE_PRESETS.CYBER_LIME).toBeDefined();
      expect(SUBTITLE_PRESETS.CYBER_LIME.highlightColor).toBe('#4ade80');

      expect(SUBTITLE_PRESETS.CLEAN_WHITE).toBeDefined();
      expect(SUBTITLE_PRESETS.CLEAN_WHITE.isUppercase).toBe(false);
    });

    it('chunks sentences into 2, 3, or 4 words properly', () => {
      const sentence = 'Why did Perseverance stop transmitting on Sol 1042';
      const chunks2 = chunkSentence(sentence, 2);
      expect(chunks2.length).toBe(4);
      expect(chunks2[0]).toBe('Why did');
      expect(chunks2[1]).toBe('Perseverance stop');

      const chunks3 = chunkSentence(sentence, 3);
      expect(chunks3[0]).toBe('Why did Perseverance');
    });

    it('tokenizes words with uppercase transformation and highlights critical keywords', () => {
      const chunk = 'Why did NASA rover stopped on Mars?';
      const tokens = tokenizeChunk(chunk, {
        ...DEFAULT_SUBTITLE_STYLE,
        isUppercase: true,
        highlightKeywords: true,
      });

      expect(tokens[0]?.text).toBe('WHY');
      expect(tokens[0]?.isKeyword).toBe(true); // Hook keyword

      expect(tokens[1]?.text).toBe('DID');
      expect(tokens[1]?.isKeyword).toBe(false);

      expect(tokens[2]?.text).toBe('NASA');
      expect(tokens[2]?.isKeyword).toBe(true);

      expect(tokens[4]?.text).toBe('STOPPED');
      expect(tokens[4]?.isKeyword).toBe(true);

      expect(tokens[6]?.text).toBe('MARS?');
      expect(tokens[6]?.isKeyword).toBe(true);
    });

    it('highlights Ukrainian keywords correctly (чому, таємниця, місяць, 99%)', () => {
      const chunk = 'Чому звʼязок обірвався і таємниця на 99%';
      const tokens = tokenizeChunk(chunk, {
        ...DEFAULT_SUBTITLE_STYLE,
        isUppercase: true,
        highlightKeywords: true,
      });

      const whyToken = tokens.find((t) => t.text === 'ЧОМУ');
      expect(whyToken?.isKeyword).toBe(true);

      const secretToken = tokens.find((t) => t.text === 'ТАЄМНИЦЯ');
      expect(secretToken?.isKeyword).toBe(true);

      const percentToken = tokens.find((t) => t.text === '99%');
      expect(percentToken?.isKeyword).toBe(true);
    });

    it('builds ASS subtitle override header with bold outline and shadow for contrast', () => {
      const assHeader = buildAssOverrideHeader({
        ...DEFAULT_SUBTITLE_STYLE,
        strokeWidth: 4,
        fontSizePx: 32,
      });

      expect(assHeader).toContain('[V4+ Styles]');
      expect(assHeader).toContain('Style: Default,Arial Black,32');
      expect(assHeader).toContain('&H00FFFFFF'); // Primary white
      expect(assHeader).toContain('4,2,2'); // Outline 4, Shadow 2
    });
  });

  describe('2. Publication Store Subtitle Style Updates', () => {
    it('updates active project subtitle style via store actions', () => {
      const store = usePublicationStore.getState();

      store.updateSubtitleStyle({
        preset: 'MRBEAST_CYAN',
        highlightColor: '#22d3ee',
        isUppercase: true,
        strokeWidth: 5,
      });

      const updated = usePublicationStore.getState().currentProject?.subtitleStyle;
      expect(updated?.preset).toBe('MRBEAST_CYAN');
      expect(updated?.highlightColor).toBe('#22d3ee');
      expect(updated?.isUppercase).toBe(true);
      expect(updated?.strokeWidth).toBe(5);
    });
  });

  describe('3. Content Language Settings (English Priority, Ukrainian, Dual Mode)', () => {
    it('sets and persists content generation language in settings store', () => {
      const store = useSettingsStore.getState();

      expect(store.settings.contentGenerationLanguage).toBe('en');

      store.setContentGenerationLanguage('uk');
      expect(useSettingsStore.getState().settings.contentGenerationLanguage).toBe('uk');

      store.setContentGenerationLanguage('dual');
      expect(useSettingsStore.getState().settings.contentGenerationLanguage).toBe('dual');

      store.setContentGenerationLanguage('en');
      expect(useSettingsStore.getState().settings.contentGenerationLanguage).toBe('en');
    });

    it('generates English priority video script when language is "en"', async () => {
      const result = await geminiAi.generateVideoScript({
        artifactId: 'perseverance-rover',
        artifactName: 'Perseverance Rover',
        rubricId: 'last-sol-drama',
        language: 'en',
      });

      expect(result.title).toContain('Mystery of the Final Signal');
      expect(result.slides[0]?.narratorText).toContain('Why did transmissions from Perseverance');
      expect(result.seoCaption.line3Tags).toContain('#space');
      expect(result.seoCaption.line3Tags).toContain('#nasa');
    });

    it('generates Ukrainian video script when language is "uk"', async () => {
      const result = await geminiAi.generateVideoScript({
        artifactId: 'perseverance-rover',
        artifactName: 'Perseverance Rover',
        rubricId: 'last-sol-drama',
        language: 'uk',
      });

      expect(result.title).toContain('Таємниця останнього сигналу');
      expect(result.slides[0]?.narratorText).toContain("Чому зв'язок з Perseverance");
      expect(result.seoCaption.line3Tags).toContain('#космос');
      expect(result.seoCaption.line3Tags).toContain('#марсохід');
    });

    it('generates Dual bilingual content when language is "dual"', async () => {
      const result = await geminiAi.generateVideoScript({
        artifactId: 'perseverance-rover',
        artifactName: 'Perseverance Rover',
        rubricId: 'last-sol-drama',
        language: 'dual',
      });

      expect(result.title).toContain('Mystery of the Final Signal • Таємниця сигналу');
      expect(result.seoCaption.line1Hook).toContain(
        'Final seconds of Perseverance Rover | Останні секунди',
      );
      expect(result.seoCaption.line3Tags).toContain('#space');
      expect(result.seoCaption.line3Tags).toContain('#космос');
    });
  });
});
