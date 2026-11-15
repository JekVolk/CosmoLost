import { httpClient } from '@/shared/api';

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  rarity: string;
  equipment_class: string;
  image_url: string | null;
  obtained_at?: string;
  is_showcased?: boolean;
}

export interface PublicShowcaseItem {
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

export interface PublicShowcaseProfile {
  callsign: string;
  avatar_frame: string;
  rank: string;
  collection_count: number;
  showcase: PublicShowcaseItem[];
}

export const inventoryRepository = {
  getInventory: (): Promise<InventoryItem[]> =>
    httpClient.get<InventoryItem[]>('/api/game/inventory/'),
  getPublicShowcase: (callsign: string): Promise<PublicShowcaseProfile> =>
    httpClient.get<PublicShowcaseProfile>(`/api/game/profile/${callsign}/`),
};
