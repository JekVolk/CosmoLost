import { httpClient } from '@/shared/api/http-client';
import type { ContainerSlot } from '../model/useContainerStore';

export const containerRepository = {
  getSlots: () => httpClient.get<ContainerSlot[]>('/api/web/game/containers/'),
  openSlot: (slot_index: number) =>
    httpClient.post<{ ok: boolean; artifact: unknown; rp_gained: number }>('/api/web/game/containers/open/', { slot_index }),
  claimDaily: () => httpClient.post<{ ok: boolean }>('/api/web/game/containers/daily/', {}),
};
