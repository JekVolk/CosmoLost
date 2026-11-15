export type CelestialGameplayPreset = 'MOON_PARKOUR' | 'MARS_DUNES' | 'EUROPA_ICE';

export type GameplayAvatarType = 'COSMIC_SPHERE' | 'LUNAR_ROVER' | 'JETPACK_ASTRONAUT';

export type GameplayAspectRatio = '9:16' | '1:1' | '16:9';

export type ObstacleType = 'PIT' | 'BOULDER' | 'FLAG' | 'SAMPLE_TUBE' | 'JUMP_PAD' | 'LEM';

export interface TelemetryMetrics {
  distanceMeters: number;
  currentSpeedKmH: number;
  gravityMps2: number;
  altitudeMeters: number;
  score: number;
  collectedSamples: number;
  comboMultiplier: number;
  environmentName: string;
}

export interface GameplayObstacle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  collected?: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

export interface GameplaySimulationConfig {
  preset: CelestialGameplayPreset;
  avatar: GameplayAvatarType;
  gravity: number;
  speedMultiplier: number;
  autoPilot: boolean;
  aspectRatio: GameplayAspectRatio;
  showTelemetry: boolean;
  soundEnabled: boolean;
}

export interface RecordedBrollClip {
  id: string;
  preset: CelestialGameplayPreset;
  avatar: GameplayAvatarType;
  durationSec: number;
  videoBlobUrl: string;
  sizeBytes: number;
  createdAt: string;
  aspectRatio: GameplayAspectRatio;
}
