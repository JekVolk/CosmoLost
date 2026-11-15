import { httpClient } from '@/shared/api/http-client';
import type { UserProfile } from '../model/useAuthStore';

export const userRepository = {
  getMe: () => httpClient.get<UserProfile>('/api/web/game/profile/me/'),
  getProfile: (callsign: string) => httpClient.get<UserProfile>(`/api/web/game/profile/${callsign}/`),
};
