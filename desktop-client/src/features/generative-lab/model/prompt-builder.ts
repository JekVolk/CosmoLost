import type { VideoScriptSlide } from '@/entities/publication';
import type { SlideModalityPrompts } from './types';

/**
 * Builds cinematic 9:16 vertical video prompt tailored for Veo 3.1 & Google Flow
 */
export function buildVeoPrompt(
  slide: VideoScriptSlide,
  artifactName: string,
  _rubricId?: string,
): string {
  if (slide.veoPrompt && slide.veoPrompt.trim().length > 0) {
    return slide.veoPrompt;
  }

  const baseVisual = slide.visualPrompt || `${artifactName} planetary discovery`;
  let motionDescription = 'Slow cinematic camera pan with depth-of-field blur';
  let atmosphere = 'dramatic cinematic lighting with volumetric dust particles';

  if (slide.type === 'HOOK') {
    motionDescription = 'Dynamic rapid push-in crash zoom, intense orbital parallax';
    atmosphere = 'high-contrast dramatic rim light, intense cosmic mystery, cinematic lens flare';
  } else if (slide.type === 'B_ROLL_FACTS') {
    motionDescription =
      'Smooth 60fps tracking shot across planetary regolith, technical HUD telemetry overlays';
    atmosphere =
      'scientific documentary lighting, crisp shadows under harsh extraterrestrial sunlight';
  } else if (slide.type === 'DRAMA_PEAK') {
    motionDescription = 'Slow sweeping arc shot into extreme close-up, ominous darkness descending';
    atmosphere =
      'chilling shadows, deep crimson and obsidian tones, dust storm engulfing solar panels';
  } else if (slide.type === 'SEAMLESS_LOOP_CTA') {
    motionDescription =
      'Smooth seamless loop rotation, orbiting from high altitude back to starting vantage point';
    atmosphere = 'vibrant neon telemetry holographic grid, glowing orbital trajectory paths';
  }

  return `Cinematic 9:16 vertical video, 4K 60fps photorealistic documentary footage. Subject: ${baseVisual} (${artifactName}). ${motionDescription}. Atmosphere: ${atmosphere}. Hyper-detailed textures, Unreal Engine 5 render style, zero gravity space dust, perfectly optimized for mobile screen.`;
}

/**
 * Builds high-fidelity image prompt tailored for Nano Banana & Imagen 3
 */
export function buildImagePrompt(slide: VideoScriptSlide, artifactName: string): string {
  if (slide.imagePrompt && slide.imagePrompt.trim().length > 0) {
    return slide.imagePrompt;
  }

  const baseVisual = slide.visualPrompt || `${artifactName} artifact`;
  return `Hyperrealistic 8K NASA archival photograph, Hasselblad medium format camera, 50mm f/1.4 lens. Depicting ${baseVisual} of ${artifactName}. Scientifically authentic planetary surface regolith, ultra-sharp textures, micro-meteorite craters, pristine insulation foil reflections, deep space void background with stars. Award-winning astronomy photo.`;
}

/**
 * Builds musical vibe prompt tailored for Lyria
 */
export function buildAudioPrompt(slide: VideoScriptSlide, _rubricId?: string): string {
  if (slide.audioPrompt && slide.audioPrompt.trim().length > 0) {
    return slide.audioPrompt;
  }

  if (slide.type === 'HOOK') {
    return '120 BPM dark atmospheric synth pulse, sub-bass drop, eerie radio frequency resonance, high suspense';
  }
  if (slide.type === 'DRAMA_PEAK') {
    return '90 BPM emotional ambient drone, melancholic analog synth strings, lonely heartbeat rhythm, cosmic isolation';
  }
  if (slide.type === 'SEAMLESS_LOOP_CTA') {
    return '128 BPM uplifting retrowave synth arpeggio, driving punchy electronic kick, futuristic momentum, seamless loop ending';
  }
  return '115 BPM cinematic documentary score, steady analog synth sequence, deep space pads, intriguing discovery vibe';
}

/**
 * Generates all modality prompts for a given slide
 */
export function extractSlideModalityPrompts(
  slide: VideoScriptSlide,
  artifactName: string,
  rubricId?: string,
): SlideModalityPrompts {
  return {
    veoPrompt: buildVeoPrompt(slide, artifactName, rubricId),
    imagePrompt: buildImagePrompt(slide, artifactName),
    audioPrompt: buildAudioPrompt(slide, rubricId),
    narratorText: slide.narratorText,
  };
}
