import { beforeEach, describe, expect, it } from 'vitest';
import { useSmartNextTopicStore } from '../src/features/smart-next-topic';

describe('Smart Next Topic Feature (REQ-FAC-13)', () => {
  beforeEach(() => {
    useSmartNextTopicStore.setState({
      isOpen: false,
      selectedTopicId: 'lunokhod-1',
    });
  });

  it('manages modal dialog visibility state correctly', () => {
    const store = useSmartNextTopicStore.getState();
    expect(store.isOpen).toBe(false);

    store.openModal();
    expect(useSmartNextTopicStore.getState().isOpen).toBe(true);

    store.closeModal();
    expect(useSmartNextTopicStore.getState().isOpen).toBe(false);
  });

  it('contains initial narrative candidates with bridge and hooks', () => {
    const candidates = useSmartNextTopicStore.getState().candidates;
    expect(candidates.length).toBeGreaterThanOrEqual(3);

    const lunokhod = candidates.find((c) => c.id === 'lunokhod-1');
    expect(lunokhod).toBeDefined();
    expect(lunokhod?.celestialBody).toBe('moon');
    expect(lunokhod?.narrativeBridge).toContain('Apollo 11');
    expect(lunokhod?.threeSecHook).toContain('laser beam bounced back');
    expect(lunokhod?.pinQuestion).toContain('👇');
    expect(lunokhod?.retentionScore).toBeGreaterThanOrEqual(80);
    expect(lunokhod?.keywords).toContain('Lunokhod');
  });

  it('updates selected topic candidate', () => {
    const store = useSmartNextTopicStore.getState();
    store.selectTopic('three-forks-depot');

    const updated = useSmartNextTopicStore.getState();
    expect(updated.selectedTopicId).toBe('three-forks-depot');
  });
});
