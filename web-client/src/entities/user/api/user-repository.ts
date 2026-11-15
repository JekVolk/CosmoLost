import { httpClient } from '@/shared/api';

export interface ShowcaseItem {
  equipment: {
    id: string;
    name: string;
    description: string;
    equipment_class: string;
    rarity: string;
    image_url: string | null;
  };
  artifact_location: { latitude: number; longitude: number } | null;
}

export interface UserProfile {
  callsign: string;
  bio: string;
  avatar_frame: string;
  favorite_planet: 'mars' | 'moon';
  elo_rating: number;
  rank: string;
  curator_index: number;
  container_count: number;
  research_points: number;
  matches_played: number;
  matches_won: number;
  current_win_streak: number;
  is_public: boolean;
  inventory_count: number;
  win_rate: number;
}

export interface PublicGameProfile {
  callsign: string;
  avatar_frame: string;
  rank: string;
  collection_count: number;
  showcase: ShowcaseItem[];
}

export const userRepository = {
  getMe: (): Promise<UserProfile> => httpClient.get<UserProfile>('/api/game/profile/me/'),
  getProfile: (callsign: string): Promise<PublicGameProfile> =>
    httpClient.get<PublicGameProfile>(`/api/game/profile/${callsign}/`),
};
