import { useCallback, useEffect, useRef, useState } from 'react';

// Pentatonic space scale frequencies (Hz) for cosmic arpeggiation
const COSMIC_SCALE = [
  130.81, // C3
  155.56, // Eb3
  174.61, // F3
  196.0, // G3
  233.08, // Bb3
  261.63, // C4
  311.13, // Eb4
  349.23, // F4
  392.0, // G4
  466.16, // Bb4
  523.25, // C5
];

export interface UsePreviewAudioOptions {
  isPlaying: boolean;
  playbackTimeSec: number;
  totalDuration?: number;
  narratorText?: string;
  initialVolume?: number;
  initialMuted?: boolean;
}

export interface UsePreviewAudioReturn {
  isMuted: boolean;
  volume: number; // 0.0 to 1.0
  toggleMute: () => void;
  setVolume: (v: number) => void;
  audioLevels: number[]; // 4 normalized values (0..1)
  ensureAudioStarted: () => Promise<void>;
}

class CosmicAudioEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private analyser: AnalyserNode | null = null;
  private compressor: DynamicsCompressorNode | null = null;

  // Active sound generator nodes
  private droneOsc: OscillatorNode | null = null;
  private droneFilter: BiquadFilterNode | null = null;
  private padOsc1: OscillatorNode | null = null;
  private padOsc2: OscillatorNode | null = null;
  private padFilter: BiquadFilterNode | null = null;
  private lfoOsc: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;

  // Arpeggiator & voice timer
  private arpTimer: NodeJS.Timeout | null = null;
  private currentVolume = 0.7;
  private isMuted = false;
  private isGenerating = false;

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    return this.ctx;
  }

  async resumeContext(): Promise<void> {
    const ctx = this.getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      try {
        await ctx.resume();
      } catch (err) {
        console.warn('[CosmicAudioEngine] Failed to resume AudioContext:', err);
      }
    }
  }

  setVolume(vol: number): void {
    this.currentVolume = Math.max(0, Math.min(1, vol));
    this.applyMasterGain();
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted;
    this.applyMasterGain();
  }

  private applyMasterGain(): void {
    if (!this.masterGain || !this.ctx) return;
    const target = this.isMuted ? 0 : this.currentVolume;
    try {
      this.masterGain.gain.setTargetAtTime(target, this.ctx.currentTime, 0.02);
    } catch {
      this.masterGain.gain.value = target;
    }
  }

  start(playbackTimeSec = 0): void {
    const ctx = this.getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      void ctx.resume();
    }

    if (this.isGenerating) {
      this.syncStep(playbackTimeSec);
      return;
    }

    this.isGenerating = true;

    try {
      const now = ctx.currentTime;

      // 1. Dynamics Compressor (prevents harsh distortion)
      this.compressor = ctx.createDynamicsCompressor();
      this.compressor.threshold.setValueAtTime(-20, now);
      this.compressor.knee.setValueAtTime(30, now);
      this.compressor.ratio.setValueAtTime(6, now);
      this.compressor.attack.setValueAtTime(0.003, now);
      this.compressor.release.setValueAtTime(0.2, now);

      // 2. Analyser Node for visual waveform feedback
      this.analyser = ctx.createAnalyser();
      this.analyser.fftSize = 64;
      this.analyser.smoothingTimeConstant = 0.75;

      // 3. Master Gain Node
      this.masterGain = ctx.createGain();
      const initialTarget = this.isMuted ? 0 : this.currentVolume;
      this.masterGain.gain.setValueAtTime(0.001, now);
      this.masterGain.gain.exponentialRampToValueAtTime(Math.max(0.001, initialTarget), now + 0.06);

      // Connect: Master Gain -> Analyser -> Compressor -> Destination
      this.masterGain.connect(this.analyser);
      this.analyser.connect(this.compressor);
      this.compressor.connect(ctx.destination);

      // 4. Ambient Sub Drone (55 Hz A1 / 65.4 Hz C2) with resonant lowpass
      this.droneFilter = ctx.createBiquadFilter();
      this.droneFilter.type = 'lowpass';
      this.droneFilter.frequency.setValueAtTime(180, now);
      this.droneFilter.Q.setValueAtTime(2.5, now);

      this.droneOsc = ctx.createOscillator();
      this.droneOsc.type = 'triangle';
      this.droneOsc.frequency.setValueAtTime(55, now);

      const droneGain = ctx.createGain();
      droneGain.gain.setValueAtTime(0.35, now);

      this.droneOsc.connect(this.droneFilter);
      this.droneFilter.connect(droneGain);
      droneGain.connect(this.masterGain);
      this.droneOsc.start(now);

      // 5. Cosmic Ethereal Pad (Chords with slight detuning)
      this.padFilter = ctx.createBiquadFilter();
      this.padFilter.type = 'lowpass';
      this.padFilter.frequency.setValueAtTime(520, now);
      this.padFilter.Q.setValueAtTime(3, now);

      // Pad Voice 1
      this.padOsc1 = ctx.createOscillator();
      this.padOsc1.type = 'sawtooth';
      this.padOsc1.frequency.setValueAtTime(130.81, now); // C3
      this.padOsc1.detune.setValueAtTime(-4, now);

      // Pad Voice 2
      this.padOsc2 = ctx.createOscillator();
      this.padOsc2.type = 'triangle';
      this.padOsc2.frequency.setValueAtTime(196.0, now); // G3
      this.padOsc2.detune.setValueAtTime(5, now);

      // LFO for breathing filter sweep
      this.lfoOsc = ctx.createOscillator();
      this.lfoOsc.type = 'sine';
      this.lfoOsc.frequency.setValueAtTime(0.25, now); // 4-second breath cycle

      this.lfoGain = ctx.createGain();
      this.lfoGain.gain.setValueAtTime(220, now); // +/- 220Hz cutoff sweep

      this.lfoOsc.connect(this.lfoGain);
      this.lfoGain.connect(this.padFilter.frequency);
      this.lfoOsc.start(now);

      const padGain = ctx.createGain();
      padGain.gain.setValueAtTime(0.18, now);

      this.padOsc1.connect(this.padFilter);
      this.padOsc2.connect(this.padFilter);
      this.padFilter.connect(padGain);
      padGain.connect(this.masterGain);

      this.padOsc1.start(now);
      this.padOsc2.start(now);

      // 6. Arpeggiator & voice pulse scheduler
      this.startArpeggiator(playbackTimeSec);
    } catch (err) {
      console.warn('[CosmicAudioEngine] Error initiating synth:', err);
    }
  }

  private startArpeggiator(initialTimeSec: number): void {
    if (this.arpTimer) clearInterval(this.arpTimer);

    let stepIndex = Math.floor(initialTimeSec * 4); // 4 pulses per second (16th notes / telemetry)

    this.arpTimer = setInterval(() => {
      if (!this.ctx || !this.isGenerating || !this.masterGain) return;
      if (this.ctx.state === 'suspended') return;

      const now = this.ctx.currentTime;
      stepIndex++;

      // Every step: Trigger a short celestial arpeggiation note
      const noteFreq = COSMIC_SCALE[stepIndex % COSMIC_SCALE.length] || 261.63;

      try {
        const noteOsc = this.ctx.createOscillator();
        const noteGain = this.ctx.createGain();

        noteOsc.type = stepIndex % 2 === 0 ? 'sine' : 'triangle';
        noteOsc.frequency.setValueAtTime(noteFreq, now);

        // Quick attack, gentle decay
        noteGain.gain.setValueAtTime(0.001, now);
        noteGain.gain.linearRampToValueAtTime(0.09, now + 0.015);
        noteGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

        noteOsc.connect(noteGain);
        noteGain.connect(this.masterGain);

        noteOsc.start(now);
        noteOsc.stop(now + 0.25);

        // Voice formant simulation (subtle radio telemetry hiss / tone when narrator speaks)
        if (stepIndex % 3 === 0) {
          const speechOsc = this.ctx.createOscillator();
          const speechGain = this.ctx.createGain();
          const speechFilter = this.ctx.createBiquadFilter();

          speechFilter.type = 'bandpass';
          speechFilter.frequency.setValueAtTime(950, now); // Formant peak
          speechFilter.Q.setValueAtTime(5, now);

          speechOsc.type = 'triangle';
          speechOsc.frequency.setValueAtTime(180, now);

          speechGain.gain.setValueAtTime(0.001, now);
          speechGain.gain.linearRampToValueAtTime(0.04, now + 0.02);
          speechGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.15);

          speechOsc.connect(speechFilter);
          speechFilter.connect(speechGain);
          speechGain.connect(this.masterGain);

          speechOsc.start(now);
          speechOsc.stop(now + 0.16);
        }
      } catch {
        // Safe skip on AudioContext edge-cases
      }
    }, 250);
  }

  syncStep(playbackTimeSec: number): void {
    if (this.isGenerating) {
      this.startArpeggiator(playbackTimeSec);
    }
  }

  stop(): void {
    if (!this.isGenerating) return;
    this.isGenerating = false;

    if (this.arpTimer) {
      clearInterval(this.arpTimer);
      this.arpTimer = null;
    }

    if (this.ctx && this.masterGain) {
      const now = this.ctx.currentTime;
      try {
        this.masterGain.gain.setTargetAtTime(0.0001, now, 0.03);
      } catch {
        // ignore
      }
    }

    setTimeout(() => {
      try {
        this.droneOsc?.stop();
        this.droneOsc?.disconnect();
        this.padOsc1?.stop();
        this.padOsc1?.disconnect();
        this.padOsc2?.stop();
        this.padOsc2?.disconnect();
        this.lfoOsc?.stop();
        this.lfoOsc?.disconnect();
        this.masterGain?.disconnect();
        this.analyser?.disconnect();
        this.compressor?.disconnect();
      } catch {
        // ignore
      } finally {
        this.droneOsc = null;
        this.padOsc1 = null;
        this.padOsc2 = null;
        this.lfoOsc = null;
        this.droneFilter = null;
        this.padFilter = null;
        this.lfoGain = null;
        this.masterGain = null;
        this.analyser = null;
        this.compressor = null;
      }
    }, 40);
  }

  getAudioLevels(): number[] {
    if (!this.analyser || !this.isGenerating || this.isMuted) {
      return [0.08, 0.08, 0.08, 0.08];
    }

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    if (bufferLength === 0) return [0.08, 0.08, 0.08, 0.08];

    // Divide spectrum into 4 bands: Sub-bass, Low-mid, High-mid, Treble
    const chunkSize = Math.max(1, Math.floor(bufferLength / 4));
    const levels: number[] = [];

    for (let i = 0; i < 4; i++) {
      let sum = 0;
      const start = i * chunkSize;
      const end = Math.min(bufferLength, start + chunkSize);
      for (let j = start; j < end; j++) {
        sum += dataArray[j] ?? 0;
      }
      const avg = sum / (end - start || 1);
      // Normalized between 0.1 and 1.0 with minimum baseline
      const normalized = Math.max(0.12, Math.min(1.0, avg / 180));
      levels.push(Number(normalized.toFixed(2)));
    }

    return levels;
  }

  dispose(): void {
    this.stop();
    if (this.ctx && this.ctx.state !== 'closed') {
      try {
        void this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

// Global or module-level singleton instance for seamless preview lifecycle
let audioEngineInstance: CosmicAudioEngine | null = null;
function getAudioEngine(): CosmicAudioEngine {
  if (!audioEngineInstance) {
    audioEngineInstance = new CosmicAudioEngine();
  }
  return audioEngineInstance;
}

export function usePreviewAudio(options: UsePreviewAudioOptions): UsePreviewAudioReturn {
  const { isPlaying, playbackTimeSec, initialVolume = 0.7, initialMuted = false } = options;

  const [isMuted, setIsMuted] = useState(initialMuted);
  const [volume, setVolumeState] = useState(initialVolume);
  const [audioLevels, setAudioLevels] = useState<number[]>([0.1, 0.1, 0.1, 0.1]);

  const engineRef = useRef<CosmicAudioEngine | null>(null);

  useEffect(() => {
    const engine = getAudioEngine();
    engineRef.current = engine;
    engine.setVolume(initialVolume);
    engine.setMuted(initialMuted);

    return () => {
      // Don't fully destroy context on simple re-renders, but ensure stopped if leaving
      engine.stop();
    };
  }, [initialVolume, initialMuted]);

  // Synchronize playing state with audio engine
  useEffect(() => {
    const engine = engineRef.current || getAudioEngine();
    if (isPlaying) {
      engine.start(playbackTimeSec);
    } else {
      engine.stop();
    }
  }, [isPlaying, playbackTimeSec]);

  // Animation frame loop for live audio levels
  useEffect(() => {
    let animId: number;
    const updateLevels = () => {
      const engine = engineRef.current;
      if (engine && isPlaying && !isMuted) {
        setAudioLevels(engine.getAudioLevels());
      } else {
        setAudioLevels([0.1, 0.1, 0.1, 0.1]);
      }
      animId = requestAnimationFrame(updateLevels);
    };

    if (isPlaying) {
      animId = requestAnimationFrame(updateLevels);
    } else {
      setAudioLevels([0.1, 0.1, 0.1, 0.1]);
    }

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [isPlaying, isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const next = !prev;
      const engine = engineRef.current || getAudioEngine();
      engine.setMuted(next);
      void engine.resumeContext();
      return next;
    });
  }, []);

  const setVolume = useCallback(
    (v: number) => {
      const clamped = Math.max(0, Math.min(1, v));
      setVolumeState(clamped);
      const engine = engineRef.current || getAudioEngine();
      engine.setVolume(clamped);
      if (clamped > 0 && isMuted) {
        setIsMuted(false);
        engine.setMuted(false);
      }
    },
    [isMuted],
  );

  const ensureAudioStarted = useCallback(async () => {
    const engine = engineRef.current || getAudioEngine();
    await engine.resumeContext();
  }, []);

  return {
    isMuted,
    volume,
    toggleMute,
    setVolume,
    audioLevels,
    ensureAudioStarted,
  };
}
