export interface TopicCandidate {
  id: string;
  name: string;
  celestialBody: 'moon' | 'mars';
  site: string;
  status: string;
  connectionType: string;
  isRecommended: boolean;
  narrativeBridge: string;
  threeSecHook: string;
  retentionScore: number;
  pinQuestion: string;
  keywords: string[];
}
