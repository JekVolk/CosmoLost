import { describe, expect, it } from 'vitest';
import { edgeTts, geminiAi } from '../src/shared/api/ai';

describe('AI Services & SMM Logic', () => {
  describe('GeminiAiClient SMM Script Generator', () => {
    it('generates a 40-second script with 4 phases for Last Sol rubric', async () => {
      const script = await geminiAi.generateVideoScript({
        artifactId: 'opportunity-rover',
        artifactName: 'Opportunity Rover (MER-B)',
        rubricId: 'last-sol-drama',
        language: 'uk',
        selectionReason: 'Загибель марсохода під час глобальної пилової бурі',
      });

      expect(script.totalDurationSec).toBe(40);
      expect(script.rubricId).toBe('last-sol-drama');
      expect(script.slides.length).toBe(4);

      // Phase 1: Hook (0-3s)
      const hook = script.slides[0];
      expect(hook.type).toBe('HOOK');
      expect(hook.durationSec).toBe(3);
      expect(hook.narratorText.length).toBeGreaterThan(10);
      expect(hook.pngtuberState).toBe('SHOCK');

      // Phase 2: B-Roll Facts
      const broll = script.slides[1];
      expect(broll.type).toBe('B_ROLL_FACTS');
      expect(broll.pngtuberState).toBe('EXPERT');

      // Phase 3: Drama Peak
      const drama = script.slides[2];
      expect(drama.type).toBe('DRAMA_PEAK');

      // Phase 4: Seamless Loop CTA
      const cta = script.slides[3];
      expect(cta.type).toBe('SEAMLESS_LOOP_CTA');
      expect(cta.pngtuberState).toBe('HYPE');

      // SEO 3-Line caption
      expect(script.seoCaption.line1Hook.length).toBeGreaterThan(5);
      expect(script.seoCaption.line2Seo).toContain('cosmolost.lihtar.org');
      expect(script.seoCaption.line3Tags).toContain('#cosmolost');
      expect(script.seoCaption.line3Tags.split(' ').length).toBeGreaterThanOrEqual(4);

      // Provocative Pin Comment
      expect(script.pinComment.length).toBeGreaterThan(15);
      expect(script.pinComment).toContain('?');
    });

    it('generates English script when requested', async () => {
      const script = await geminiAi.generateVideoScript({
        artifactId: 'apollo-11-lm-eagle',
        artifactName: 'Apollo 11 Eagle',
        rubricId: 'tech-explain',
        language: 'en',
      });

      expect(script.slides[0].narratorText).toContain('Apollo 11 Eagle');
      expect(script.seoCaption.line3Tags).toContain('#nasa');
    });

    it('recommends next topic with twin narrative bridge for Spirit', async () => {
      const recommendation = await geminiAi.recommendNextTopic({
        currentArtifactId: 'spirit-rover',
        currentRubricId: 'last-sol-drama',
      });

      expect(recommendation.suggestedArtifactId).toBe('opportunity-rover');
      expect(recommendation.suggestedArtifactName).toContain('Opportunity');
      expect(recommendation.narrativeBridge).toContain('Spirit');
      expect(recommendation.narrativeBridge).toContain('Opportunity');
      expect(recommendation.suggestedHook.length).toBeGreaterThan(10);
      expect(recommendation.recommendedPinComment).toContain('?');
    });

    it('recommends next topic for Opportunity bridging to Apollo 11', async () => {
      const recommendation = await geminiAi.recommendNextTopic({
        currentArtifactId: 'opportunity-rover',
        currentRubricId: 'last-sol-drama',
      });

      expect(recommendation.suggestedArtifactId).toBe('apollo-11-lm-eagle');
      expect(recommendation.narrativeBridge).toContain('Місяць');
    });
  });

  describe('EdgeTtsClient & Lip-Sync Engine', () => {
    it('synthesizes voice with Jump-Cut pause trimming and RMS frames', async () => {
      const text =
        'Мій годинник зупинився на Sol 5111. Пилова буря заблокувала сонячні панелі марсохода.';
      const res = await edgeTts.synthesizeVoice({
        text,
        voice: 'uk-UA-OstapNeural',
        speedRate: 1.1,
        enableJumpCut: true,
      });

      expect(res.durationSec).toBeGreaterThan(2.0);
      expect(res.jumpCutTrimsCount).toBeGreaterThanOrEqual(1);
      expect(res.rmsFrames.length).toBeGreaterThan(20);

      // Verify discrete 50ms sampling
      expect(res.rmsFrames[0].timestampMs).toBe(0);
      expect(res.rmsFrames[1].timestampMs).toBe(50);
      expect(res.rmsFrames[2].timestampMs).toBe(100);

      // Verify boolean mouth status calculated from RMS threshold
      const hasOpenFrames = res.rmsFrames.some((f) => f.isMouthOpen);
      const hasClosedFrames = res.rmsFrames.some((f) => !f.isMouthOpen);
      expect(hasOpenFrames).toBe(true);
      expect(hasClosedFrames).toBe(true);
    });

    it('provides supported Ukrainian and English neural voices', () => {
      const voices = edgeTts.getSupportedVoices();
      expect(voices.length).toBeGreaterThanOrEqual(4);
      expect(voices.some((v) => v.id === 'uk-UA-OstapNeural')).toBe(true);
      expect(voices.some((v) => v.id === 'en-US-GuyNeural')).toBe(true);
    });
  });
});
