import type { PublicGameProfile } from '@/entities/user';
import { httpClient } from '@/shared/api';

export interface ShowcaseSlotUpdate {
  inventory_item_id: number | string;
  slot: number;
}

export const showcaseRepository = {
  getShowcase: (callsign: string): Promise<PublicGameProfile> =>
    httpClient.get<PublicGameProfile>(`/api/game/profile/${callsign}/`),
  updateShowcase: (slots: ShowcaseSlotUpdate[]): Promise<{ status: string }> =>
    httpClient.post('/api/game/showcase/update/', { slots }),
};
