import { create } from 'zustand';
import type { TopicCandidate } from './types';

const INITIAL_CANDIDATES: TopicCandidate[] = [
  {
    id: 'lunokhod-1',
    name: 'Lunokhod 1',
    celestialBody: 'moon',
    site: 'Mare Imbrium',
    status: 'Asleep (Laser Bounced)',
    connectionType: 'Direct Lunar Timeline',
    isRecommended: true,
    narrativeBridge:
      'While the Apollo 11 astronauts flew safely back to Earth, another lonely explorer was about to touch down on the Moon with no return ticket...',
    threeSecHook:
      'NASA thought this Soviet moon rover was gone forever. Then in 2010, a laser beam bounced back from the dark...',
    retentionScore: 88,
    pinQuestion:
      'Did you know Lunokhod 1 drove over 10 km on remote control in 1970? Which space rover is your personal favorite? Tell us below! 👇',
    keywords: ['Lunokhod', 'MoonRover', 'SovietSpace', 'LaserRetroreflector', 'MareImbrium'],
  },
  {
    id: 'three-forks-depot',
    name: 'Three Forks Sample Depot',
    celestialBody: 'mars',
    site: 'Jezero Crater',
    status: 'Active sample cache',
    connectionType: 'Contrast Active vs Lost',
    isRecommended: false,
    narrativeBridge:
      'Far from Apollo footprints, on the rusted plains of Mars, humanity has left something brand new: ten sealed titanium tubes of alien rock.',
    threeSecHook:
      'Inside these 10 titanium tubes lies the greatest secret in the solar system. But there is a deadly catch...',
    retentionScore: 84,
    pinQuestion:
      'If NASA can only bring back 3 sample tubes from Mars, should they prioritize ancient lake mud or volcanic crystals? 👇',
    keywords: ['Perseverance', 'MarsSampleReturn', 'JezeroCrater', 'AlienLife', 'NASA'],
  },
  {
    id: 'opportunity-heat-shield',
    name: 'Opportunity Heat Shield Debris',
    celestialBody: 'mars',
    site: 'Meridiani Planum',
    status: 'Impact debris',
    connectionType: 'Tragedy of the last Sol',
    isRecommended: false,
    narrativeBridge:
      'Before Opportunity could find signs of water on Mars, its heat shield had to endure 2,000 degrees and smash into the red dust.',
    threeSecHook:
      'This scorched wreckage looks like an alien crash site. But it actually saved NASA most beloved rover...',
    retentionScore: 81,
    pinQuestion:
      'Should space wreckage on Mars be declared historical monuments or recycled by future colonists? Drop your opinion! 👇',
    keywords: ['Opportunity', 'HeatShield', 'MeridianiPlanum', 'MarsExploration', 'SpaceHistory'],
  },
];

interface SmartNextTopicState {
  isOpen: boolean;
  selectedTopicId: string;
  candidates: TopicCandidate[];

  openModal: () => void;
  closeModal: () => void;
  selectTopic: (id: string) => void;
}

export const useSmartNextTopicStore = create<SmartNextTopicState>((set) => ({
  isOpen: false,
  selectedTopicId: 'lunokhod-1',
  candidates: INITIAL_CANDIDATES,

  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
  selectTopic: (id: string) => set({ selectedTopicId: id }),
}));

export function useSelectedTopic(): TopicCandidate {
  const selectedTopicId = useSmartNextTopicStore((s) => s.selectedTopicId);
  const candidates = useSmartNextTopicStore((s) => s.candidates);
  const fallback = INITIAL_CANDIDATES[0] as TopicCandidate;
  const found = candidates.find((c) => c.id === selectedTopicId);
  const first = candidates[0];
  if (found) return found;
  if (first) return first;
  return fallback;
}
