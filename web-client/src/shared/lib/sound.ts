/**
 * Audio sound effects and background music controller for CosmoLost.
 * All sound assets are located in /assets/audio/
 */

export type SfxType =
  | 'chest_click'
  | 'chest_open_common'
  | 'chest_open_historic'
  | 'timer_tick'
  | 'answer_correct'
  | 'answer_wrong'
  | 'match_win'
  | 'match_defeat';

const SFX_MAP: Record<SfxType, string> = {
  chest_click: '/assets/audio/sfx_chest_click.wav',
  chest_open_common: '/assets/audio/sfx_chest_open_common.wav',
  chest_open_historic: '/assets/audio/sfx_chest_open_historic.wav',
  timer_tick: '/assets/audio/sfx_timer_tick.wav',
  answer_correct: '/assets/audio/sfx_answer_correct.wav',
  answer_wrong: '/assets/audio/sfx_answer_wrong.wav',
  match_win: '/assets/audio/sfx_match_win.wav',
  match_defeat: '/assets/audio/sfx_match_defeat.wav',
};

const BGM_PATH = '/assets/audio/bgm_arena_ambient.wav';

let isMuted = false;
let currentBgm: HTMLAudioElement | null = null;

export function setAudioMuted(muted: boolean): void {
  isMuted = muted;
  if (currentBgm) {
    currentBgm.muted = muted;
  }
}

export function isAudioMuted(): boolean {
  return isMuted;
}

export function playSfx(type: SfxType, volume = 0.7): void {
  if (isMuted || typeof window === 'undefined') return;

  const path = SFX_MAP[type];
  if (!path) return;

  try {
    const audio = new Audio(path);
    audio.volume = Math.max(0, Math.min(1, volume));
    audio.play().catch(() => {
      // Browser autoplay policy might block audio before first user interaction
    });
  } catch {
    // Gracefully handle unsupported audio environments
  }
}

export function playBgm(volume = 0.25): void {
  if (isMuted || typeof window === 'undefined') return;

  if (!currentBgm) {
    currentBgm = new Audio(BGM_PATH);
    currentBgm.loop = true;
    currentBgm.volume = Math.max(0, Math.min(1, volume));
  }

  currentBgm.play().catch(() => {
    // Autoplay policy waiting for user gesture
  });
}

export function stopBgm(): void {
  if (currentBgm) {
    currentBgm.pause();
    currentBgm.currentTime = 0;
  }
}
