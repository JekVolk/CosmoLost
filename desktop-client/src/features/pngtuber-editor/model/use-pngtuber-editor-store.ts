import { create } from 'zustand';
import { CHARACTER_PRESETS, INITIAL_SPRITES } from './presets';
import type {
  AvatarEmotionType,
  AvatarMouthPhase,
  CharacterPreset,
  CreateCustomAvatarPayload,
  PngTuberKinematics,
  PngTuberSpriteItem,
} from './types';

const STORAGE_KEY = 'cosmolost_custom_avatars';

function loadInitialCustomAvatars(): CharacterPreset[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persistCustomAvatars(avatars: CharacterPreset[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(avatars));
  } catch {
    // Non-blocking storage fallback
  }
}

interface PngTuberEditorState {
  isOpen: boolean;
  isCreateAvatarModalOpen: boolean;
  selectedCharacterId: string;
  selectedEmotion: AvatarEmotionType;
  testPhase: AvatarMouthPhase;
  sprites: PngTuberSpriteItem[];
  customCharacters: CharacterPreset[];
  kinematics: PngTuberKinematics;
  isMicTestActive: boolean;
  simulatedRmsDb: number;

  openModal: () => void;
  closeModal: () => void;
  openCreateAvatarModal: () => void;
  closeCreateAvatarModal: () => void;
  selectCharacter: (id: string) => void;
  selectEmotion: (emotion: AvatarEmotionType) => void;
  setTestPhase: (phase: AvatarMouthPhase) => void;
  updateSpriteUpload: (spriteId: string, dataUrl: string) => void;
  addCustomCharacter: (payload: CreateCustomAvatarPayload) => CharacterPreset;
  deleteCustomCharacter: (id: string) => void;
  updateCustomCharacter: (id: string, updates: Partial<CharacterPreset>) => void;
  setRmsThresholdDb: (db: number) => void;
  toggleMicTest: () => void;
  setSimulatedRmsDb: (db: number) => void;
  resetToDefaults: () => void;
}

export const usePngTuberEditorStore = create<PngTuberEditorState>((set, get) => ({
  isOpen: false,
  isCreateAvatarModalOpen: false,
  selectedCharacterId: 'cosmo-spark',
  selectedEmotion: 'IDLE',
  testPhase: 'CLOSED',
  sprites: INITIAL_SPRITES,
  customCharacters: loadInitialCustomAvatars(),
  kinematics: {
    hookPosition: {
      y: 1500,
      x: 'center',
      scale: 1.2,
      durationSec: 3.5,
    },
    parkedPosition: {
      y: 1700,
      x: 'left',
      scale: 0.85,
      deadZoneClearancePx: 420,
    },
    rmsThresholdDb: -22,
    rmsThresholdNormalized: 0.15,
    gateAttackMs: 60,
    gateReleaseMs: 120,
    blinkJitterSec: 3.5,
  },
  isMicTestActive: false,
  simulatedRmsDb: -35,

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false, isMicTestActive: false }),
  openCreateAvatarModal: () => set({ isCreateAvatarModalOpen: true }),
  closeCreateAvatarModal: () => set({ isCreateAvatarModalOpen: false }),
  selectCharacter: (id: string) => {
    set({ selectedCharacterId: id });
    const allChars = [...CHARACTER_PRESETS, ...get().customCharacters];
    const target = allChars.find((c) => c.id === id);
    if (target?.avatarImageUrl) {
      // Propagate main custom image as baseline sprites if not overridden
      set((state) => ({
        sprites: state.sprites.map((s) => ({
          ...s,
          customDataUrl:
            target.customSprites?.[s.emotion]?.[s.phase === 'OPEN' ? 'open' : 'closed'] ||
            target.avatarImageUrl,
        })),
      }));
    }
  },
  selectEmotion: (emotion: AvatarEmotionType) => set({ selectedEmotion: emotion }),
  setTestPhase: (phase: AvatarMouthPhase) => set({ testPhase: phase }),

  updateSpriteUpload: (spriteId: string, dataUrl: string) => {
    set((state) => ({
      sprites: state.sprites.map((s) => (s.id === spriteId ? { ...s, customDataUrl: dataUrl } : s)),
    }));
  },

  addCustomCharacter: (payload: CreateCustomAvatarPayload): CharacterPreset => {
    const id = `custom-avatar-${Date.now()}`;
    const palette =
      payload.palette.length > 0 ? payload.palette : ['#38BDF8', '#0C2A45', '#F8FAFC'];
    const newChar: CharacterPreset = {
      id,
      name: payload.name.trim() || 'Мій кастомний аватар',
      role: payload.role.trim() || 'CUSTOM CREATOR',
      tag: payload.tag.trim() || 'VTUBER',
      archetype: payload.archetype.trim() || 'Користувацький персонаж-директор.',
      palette,
      paletteLabel: palette.join(' • '),
      targetFormat: 'YouTube Shorts & TikTok',
      voicePairing: payload.voicePairing || 'Warm, Custom Tone',
      signatureFeature: payload.signatureFeature || 'Власні імпортовані спрайти',
      telemetry: 'CUSTOM AVATAR NOMINAL',
      isCustom: true,
      avatarImageUrl: payload.avatarImageUrl,
      customSprites: payload.customSprites,
      createdAt: new Date().toISOString(),
    };

    const nextCustomList = [...get().customCharacters, newChar];
    persistCustomAvatars(nextCustomList);

    set((state) => ({
      customCharacters: nextCustomList,
      selectedCharacterId: id,
      isCreateAvatarModalOpen: false,
      sprites: payload.avatarImageUrl
        ? state.sprites.map((s) => ({
            ...s,
            customDataUrl:
              payload.customSprites?.[s.emotion]?.[s.phase === 'OPEN' ? 'open' : 'closed'] ||
              payload.avatarImageUrl,
          }))
        : state.sprites,
    }));

    return newChar;
  },

  deleteCustomCharacter: (id: string) => {
    const filtered = get().customCharacters.filter((c) => c.id !== id);
    persistCustomAvatars(filtered);
    set({
      customCharacters: filtered,
      selectedCharacterId:
        get().selectedCharacterId === id ? 'cosmo-spark' : get().selectedCharacterId,
    });
  },

  updateCustomCharacter: (id: string, updates: Partial<CharacterPreset>) => {
    const updatedList = get().customCharacters.map((c) => (c.id === id ? { ...c, ...updates } : c));
    persistCustomAvatars(updatedList);
    set({ customCharacters: updatedList });
  },

  setRmsThresholdDb: (db: number) => {
    set((state) => ({
      kinematics: {
        ...state.kinematics,
        rmsThresholdDb: db,
        rmsThresholdNormalized: Number(Math.max(0.01, Math.min(1, 10 ** (db / 20))).toFixed(3)),
      },
    }));
  },

  toggleMicTest: () => {
    const next = !get().isMicTestActive;
    set({
      isMicTestActive: next,
      simulatedRmsDb: next ? -18 : -35,
      testPhase: next ? 'OPEN' : 'CLOSED',
    });
  },

  setSimulatedRmsDb: (db: number) => {
    const threshold = get().kinematics.rmsThresholdDb;
    set({
      simulatedRmsDb: db,
      testPhase: db >= threshold ? 'OPEN' : 'CLOSED',
    });
  },

  resetToDefaults: () => {
    persistCustomAvatars([]);
    set({
      sprites: INITIAL_SPRITES,
      customCharacters: [],
      selectedCharacterId: 'cosmo-spark',
      kinematics: {
        hookPosition: {
          y: 1500,
          x: 'center',
          scale: 1.2,
          durationSec: 3.5,
        },
        parkedPosition: {
          y: 1700,
          x: 'left',
          scale: 0.85,
          deadZoneClearancePx: 420,
        },
        rmsThresholdDb: -22,
        rmsThresholdNormalized: 0.15,
        gateAttackMs: 60,
        gateReleaseMs: 120,
        blinkJitterSec: 3.5,
      },
    });
  },
}));

export function useAllCharacters(): CharacterPreset[] {
  const customCharacters = usePngTuberEditorStore((s) => s.customCharacters);
  return [...CHARACTER_PRESETS, ...customCharacters];
}

export function useActiveCharacter(): CharacterPreset {
  const selectedCharacterId = usePngTuberEditorStore((s) => s.selectedCharacterId);
  const customCharacters = usePngTuberEditorStore((s) => s.customCharacters);
  const allCharacters = [...CHARACTER_PRESETS, ...customCharacters];

  return (
    allCharacters.find((c) => c.id === selectedCharacterId) ||
    allCharacters[0] || {
      id: 'cosmo-spark',
      name: 'Cosmo Spark (Mascot)',
      role: 'LUNAR CADET #01',
      tag: 'CUTE CHIBI',
      archetype: 'The Inquisitive Lunar Explorer.',
      palette: ['#38BDF8', '#0C2A45', '#F8FAFC'],
      paletteLabel: '#38BDF8 • #0C2A45 • #F8FAFC',
      targetFormat: 'TikTok & Shorts Mainstream',
      voicePairing: 'Warm, Curious, Upbeat',
      signatureFeature: 'Blinking Beacon Antenna',
      telemetry: 'DSN LINK: NOMINAL',
    }
  );
}
