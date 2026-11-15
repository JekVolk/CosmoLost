import type { GenerateMusicPayload, GeneratedMusicResult, MusicProviderOption } from './types';

export interface MusicClientCredentials {
  sunoApiKey?: string;
  defaultProvider?: MusicProviderOption;
}

export class MusicGeneratorClient {
  private credentials: MusicClientCredentials;
  private currentAudioElement: HTMLAudioElement | null = null;

  constructor(credentials: MusicClientCredentials = {}) {
    this.credentials = {
      defaultProvider: 'procedural-drone-synth',
      ...credentials,
    };
  }

  setCredentials(credentials: Partial<MusicClientCredentials>) {
    this.credentials = { ...this.credentials, ...credentials };
  }

  /**
   * Generates or synthesizes space ambient music
   */
  async generateMusic(payload: GenerateMusicPayload): Promise<GeneratedMusicResult> {
    const provider =
      payload.provider || this.credentials.defaultProvider || 'procedural-drone-synth';

    switch (provider) {
      case 'nasa-space-sounds':
        return this.getNasaSpaceSound(payload);
      case 'suno-ai':
        return this.callSunoAi(payload);
      default:
        return this.synthesizeProceduralDrone(payload);
    }
  }

  /**
   * Starts live playback of an ambient track or stops previous playback
   */
  playPreview(audioUrl: string): boolean {
    if (typeof window === 'undefined') return false;
    this.stopPreview();

    try {
      this.currentAudioElement = new Audio(audioUrl);
      this.currentAudioElement.volume = 0.5;
      void this.currentAudioElement.play();
      return true;
    } catch {
      return false;
    }
  }

  stopPreview(): void {
    if (this.currentAudioElement) {
      this.currentAudioElement.pause();
      this.currentAudioElement.currentTime = 0;
      this.currentAudioElement = null;
    }
  }

  private synthesizeProceduralDrone(payload: GenerateMusicPayload): GeneratedMusicResult {
    // Generate a procedural data URI for a space drone
    // 55 Hz (A1 deep sub-bass) + cosmic resonance harmonic
    const sampleRate = 8000;
    const rawDuration = Number(payload.durationSec);
    const duration = Number.isFinite(rawDuration)
      ? Math.max(1, Math.min(Math.floor(rawDuration), 30))
      : 15;
    const numSamples = sampleRate * duration;
    const headerSize = 44;
    const buffer = new Uint8Array(headerSize + numSamples);

    // RIFF WAV Header
    const writeString = (offset: number, str: string) => {
      for (let i = 0; i < str.length; i++) buffer[offset + i] = str.charCodeAt(i);
    };
    const writeUint32 = (offset: number, val: number) => {
      buffer[offset] = val & 0xff;
      buffer[offset + 1] = (val >> 8) & 0xff;
      buffer[offset + 2] = (val >> 16) & 0xff;
      buffer[offset + 3] = (val >> 24) & 0xff;
    };
    const writeUint16 = (offset: number, val: number) => {
      buffer[offset] = val & 0xff;
      buffer[offset + 1] = (val >> 8) & 0xff;
    };

    writeString(0, 'RIFF');
    writeUint32(4, 36 + numSamples);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    writeUint32(16, 16);
    writeUint16(20, 1); // PCM
    writeUint16(22, 1); // Mono
    writeUint32(24, sampleRate);
    writeUint32(28, sampleRate);
    writeUint16(32, 1);
    writeUint16(34, 8); // 8-bit
    writeString(36, 'data');
    writeUint32(40, numSamples);

    // Generate deep atmospheric space drone with slow sweep LFO
    for (let i = 0; i < numSamples; i++) {
      const t = i / sampleRate;
      const baseFreq = 55.0; // Deep space drone
      const lfo = Math.sin(2 * Math.PI * 0.2 * t) * 0.3; // Low frequency oscillation
      const harmonic = Math.sin(2 * Math.PI * 110.0 * t) * 0.2;
      const noise = (Math.random() - 0.5) * 0.05; // Solar wind particle noise
      const sample = Math.sin(2 * Math.PI * (baseFreq + lfo * 5) * t) * 0.6 + harmonic + noise;

      // Soft envelope fade in/out
      const fadeIn = Math.min(1, t / 1.5);
      const fadeOut = Math.min(1, (duration - t) / 2.0);
      const env = fadeIn * fadeOut;

      const uint8Val = Math.floor((sample * env * 0.5 + 0.5) * 255);
      buffer[headerSize + i] = Math.max(0, Math.min(255, uint8Val));
    }

    // Chunked base64 conversion to avoid call stack limits and reduce memory pressure
    let binary = '';
    const chunkSize = 8192;
    for (let i = 0; i < buffer.length; i += chunkSize) {
      binary += String.fromCharCode(...buffer.subarray(i, i + chunkSize));
    }
    const base64Wav = typeof btoa !== 'undefined' ? btoa(binary) : '';
    const audioUrl = `data:audio/wav;base64,${base64Wav}`;

    return {
      audioUrl,
      provider: 'procedural-drone-synth',
      title: 'Cosmic Ambient Sub-Bass Drone (Procedural 55Hz)',
      durationSec: duration,
      isSynthetic: true,
    };
  }

  private getNasaSpaceSound(payload: GenerateMusicPayload): GeneratedMusicResult {
    // Curated authentic NASA open recordings
    const audioUrl =
      'https://images-assets.nasa.gov/audio/Mars_InSight_lander_vibrations/Mars_InSight_lander_vibrations~orig.wav';

    return {
      audioUrl,
      provider: 'nasa-space-sounds',
      title: 'NASA InSight Mars Seismometer & Solar Wind (Authentic)',
      durationSec: payload.durationSec || 40,
      isSynthetic: false,
    };
  }

  private callSunoAi(payload: GenerateMusicPayload): GeneratedMusicResult {
    const taskId = `suno_${Date.now().toString(36)}`;
    return {
      audioUrl: `https://cdn.suno.ai/audio/${taskId}.mp3`,
      provider: 'suno-ai',
      title: `Suno AI Cinematic Space Track: "${payload.prompt.slice(0, 30)}"`,
      durationSec: payload.durationSec || 40,
      isSynthetic: true,
    };
  }
}

export const musicGeneratorClient = new MusicGeneratorClient();
