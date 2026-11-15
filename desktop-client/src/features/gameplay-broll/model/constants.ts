import type {
  CelestialGameplayPreset,
  GameplayAspectRatio,
  GameplayAvatarType,
  GameplaySimulationConfig,
} from './types';

export interface CelestialPresetConfig {
  id: CelestialGameplayPreset;
  name: string;
  subtitle: string;
  description: string;
  gravity: number;
  gravityDisplay: number; // m/s^2
  jumpForce: number;
  baseSpeed: number;
  skyGradient: [string, string];
  groundColor: string;
  groundHighlight: string;
  dustColor: string;
  accentGlow: string;
  ambientStarsCount: number;
  horizonCelestial: 'EARTH' | 'PHOBOS' | 'JUPITER';
}

export const CELESTIAL_PRESETS: Record<CelestialGameplayPreset, CelestialPresetConfig> = {
  MOON_PARKOUR: {
    id: 'MOON_PARKOUR',
    name: 'Місячний Паркур (Apollo-11)',
    subtitle: 'Море Спокою • Sea of Tranquility',
    description:
      'Низька місячна гравітація (1.62 м/с²), довгі плавні стрибки над базальтовими кратерами, прапори Apollo 11 та капсула LEM.',
    gravity: 0.32,
    gravityDisplay: 1.62,
    jumpForce: -9.5,
    baseSpeed: 5.4,
    skyGradient: ['#050814', '#0d1527'],
    groundColor: '#334155',
    groundHighlight: '#64748b',
    dustColor: '#cbd5e1',
    accentGlow: '#38bdf8',
    ambientStarsCount: 75,
    horizonCelestial: 'EARTH',
  },
  MARS_DUNES: {
    id: 'MARS_DUNES',
    name: 'Марсіанські Дюни (Perseverance)',
    subtitle: 'Кратер Єзеро • Jezero Basin',
    description:
      'Динамічний раш по теракотових пісках (3.72 м/с²), скельні каньйони, збір титанових кернів та силуети супутників Фобоса.',
    gravity: 0.55,
    gravityDisplay: 3.72,
    jumpForce: -11.2,
    baseSpeed: 6.2,
    skyGradient: ['#230b06', '#451a03'],
    groundColor: '#9a3412',
    groundHighlight: '#c2410c',
    dustColor: '#fdba74',
    accentGlow: '#f97316',
    ambientStarsCount: 45,
    horizonCelestial: 'PHOBOS',
  },
  EUROPA_ICE: {
    id: 'EUROPA_ICE',
    name: 'Крижаний Розлом Європи (Jupiter)',
    subtitle: 'Підповерхневий Океан • Ocean Worlds',
    description:
      'Кріо-гейзери з потужним підкиданням, ковзання по неоновому льоду (1.31 м/с²) і колосальний диск Юпітера на видноколі.',
    gravity: 0.26,
    gravityDisplay: 1.31,
    jumpForce: -8.8,
    baseSpeed: 6.8,
    skyGradient: ['#020b18', '#082f49'],
    groundColor: '#0e7490',
    groundHighlight: '#22d3ee',
    dustColor: '#a5f3fc',
    accentGlow: '#06b6d4',
    ambientStarsCount: 85,
    horizonCelestial: 'JUPITER',
  },
};

export const AVATAR_OPTIONS: { id: GameplayAvatarType; label: string; icon: string }[] = [
  { id: 'COSMIC_SPHERE', label: 'Неоновий Шар (Satisfying Marble)', icon: '⚪' },
  { id: 'LUNAR_ROVER', label: 'NASA Марсохід / Ровер (6-Wheel)', icon: '🚙' },
  { id: 'JETPACK_ASTRONAUT', label: 'Астронавт з Джетпаком (EVA)', icon: '🧑‍🚀' },
];

export const ASPECT_RATIO_PRESETS: Record<
  GameplayAspectRatio,
  { label: string; width: number; height: number; cssAspect: string }
> = {
  '9:16': { label: '9:16 Shorts / Reels / TikTok', width: 1080, height: 1920, cssAspect: '9 / 16' },
  '1:1': { label: '1:1 Квадратний пост', width: 1080, height: 1080, cssAspect: '1 / 1' },
  '16:9': { label: '16:9 Широкоформатне відео', width: 1920, height: 1080, cssAspect: '16 / 9' },
};

export const DEFAULT_SIMULATION_CONFIG: GameplaySimulationConfig = {
  preset: 'MOON_PARKOUR',
  avatar: 'COSMIC_SPHERE',
  gravity: 0.32,
  speedMultiplier: 1.0,
  autoPilot: true,
  aspectRatio: '9:16',
  showTelemetry: true,
  soundEnabled: false,
};
