import { httpClient } from '@/shared/api';

export interface ContainerSlot {
  slot_index: number;
  container_type: string;
  filled_at: string;
  seal_progress: 0 | 50;
  is_reserved: boolean;
}

export interface ContainerSlotsResponse {
  slots: ContainerSlot[];
  next_fill_at: string | null;
}

export interface DailyClaimState {
  status: 'claimed' | 'pending_space' | 'already_claimed';
  expires_at: string | null;
}

export interface MatchCreateResponse {
  match_id: string;
  ws_url: string;
  config?: Record<string, unknown>;
}

export const containerRepository = {
  getSlots: (): Promise<ContainerSlotsResponse> =>
    httpClient.get<ContainerSlotsResponse>('/api/game/containers/'),
  startMatchWithSlot: (slot_index: number): Promise<MatchCreateResponse> =>
    httpClient.post<MatchCreateResponse>('/api/game/match/create/', {
      slot_index,
    }),
  claimDaily: (): Promise<DailyClaimState> =>
    httpClient.post<DailyClaimState>('/api/game/containers/daily/', {}),
};
