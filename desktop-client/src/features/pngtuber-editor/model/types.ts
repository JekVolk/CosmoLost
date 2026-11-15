export type AvatarEmotionType = 'IDLE' | 'EXPERT' | 'SHOCK' | 'HYPE';
export type AvatarMouthPhase = 'CLOSED' | 'OPEN';

export interface PngTuberSpriteItem {
  id: string;
  emotion: AvatarEmotionType;
  phase: AvatarMouthPhase;
  name: string;
  badge: string;
  description: string;
  filename: string;
  customDataUrl?: string;
  meta: string;
}

export interface CharacterPreset {
  id: string;
  name: string;
  role: string;
  tag: string;
  archetype: string;
  palette: string[];
  paletteLabel: string;
  targetFormat: string;
  voicePairing: string;
  signatureFeature: string;
  telemetry: string;
  isCustom?: boolean;
  avatarImageUrl?: string;
  customSprites?: Partial<Record<AvatarEmotionType, { closed?: string; open?: string }>>;
  createdAt?: string;
}

export interface CreateCustomAvatarPayload {
  name: string;
  role: string;
  tag: string;
  archetype: string;
  palette: string[];
  avatarImageUrl?: string;
  signatureFeature?: string;
  voicePairing?: string;
  customSprites?: Partial<Record<AvatarEmotionType, { closed?: string; open?: string }>>;
}

export interface PngTuberKinematics {
  hookPosition: {
    y: number; // e.g. 1500px
    x: 'center' | 'left' | 'right';
    scale: number;
    durationSec: number; // 0 - 3.5s
  };
  parkedPosition: {
    y: number; // e.g. 1700px (above 420px bottom dead zone in 1920px canvas)
    x: 'center' | 'left' | 'right';
    scale: number;
    deadZoneClearancePx: number; // 420px
  };
  rmsThresholdDb: number; // -22 dB
  rmsThresholdNormalized: number; // 0.15
  gateAttackMs: number; // 60ms
  gateReleaseMs: number; // 120ms
  blinkJitterSec: number; // 3.5s
}
