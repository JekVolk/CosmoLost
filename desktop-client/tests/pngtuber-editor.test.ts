import { beforeEach, describe, expect, it } from 'vitest';
import { usePngTuberEditorStore } from '../src/features/pngtuber-editor';

describe('PNGTuber Avatar Editor Feature (REQ-FAC-06, REQ-FAC-07)', () => {
  beforeEach(() => {
    usePngTuberEditorStore.getState().resetToDefaults();
  });

  it('manages modal visibility state and closes mic test upon close', () => {
    const store = usePngTuberEditorStore.getState();
    expect(store.isOpen).toBe(false);

    store.openModal();
    expect(usePngTuberEditorStore.getState().isOpen).toBe(true);

    store.toggleMicTest();
    expect(usePngTuberEditorStore.getState().isMicTestActive).toBe(true);

    store.closeModal();
    expect(usePngTuberEditorStore.getState().isOpen).toBe(false);
    expect(usePngTuberEditorStore.getState().isMicTestActive).toBe(false);
  });

  it('contains an 8-sprite matrix (4 emotions x 2 mouth phases)', () => {
    const sprites = usePngTuberEditorStore.getState().sprites;
    expect(sprites.length).toBe(8);

    const emotions = new Set(sprites.map((s) => s.emotion));
    expect(emotions.has('IDLE')).toBe(true);
    expect(emotions.has('EXPERT')).toBe(true);
    expect(emotions.has('SHOCK')).toBe(true);
    expect(emotions.has('HYPE')).toBe(true);

    const openMouthSprites = sprites.filter((s) => s.phase === 'OPEN');
    const closedMouthSprites = sprites.filter((s) => s.phase === 'CLOSED');
    expect(openMouthSprites.length).toBe(4);
    expect(closedMouthSprites.length).toBe(4);
  });

  it('updates RMS threshold dB and recalculates normalized amplitude', () => {
    const store = usePngTuberEditorStore.getState();
    expect(store.kinematics.rmsThresholdDb).toBe(-22);

    store.setRmsThresholdDb(-18);
    const updated = usePngTuberEditorStore.getState();
    expect(updated.kinematics.rmsThresholdDb).toBe(-18);
    expect(updated.kinematics.rmsThresholdNormalized).toBeGreaterThan(0.1);
  });

  it('allows custom sprite upload per slot', () => {
    const store = usePngTuberEditorStore.getState();
    const testSlot = store.sprites[0]?.id || 'slot-0';
    const testDataUrl =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

    store.updateSpriteUpload(testSlot, testDataUrl);

    const updatedSprite = usePngTuberEditorStore.getState().sprites.find((s) => s.id === testSlot);
    expect(updatedSprite?.customDataUrl).toBe(testDataUrl);
  });

  it('verifies kinematic positioning rules for hook and safe parked zone', () => {
    const { kinematics } = usePngTuberEditorStore.getState();

    // Hook position: centered, large scale during first 0-3.5 seconds
    expect(kinematics.hookPosition.x).toBe('center');
    expect(kinematics.hookPosition.scale).toBeGreaterThanOrEqual(1.0);
    expect(kinematics.hookPosition.durationSec).toBe(3.5);

    // Parked position: docked to the corner, clearing the 420px dead zone
    expect(kinematics.parkedPosition.deadZoneClearancePx).toBe(420);
    expect(kinematics.parkedPosition.scale).toBeLessThan(1.0);
  });
});
