import { setAuthTokenProvider } from '@/shared/api';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AuthUser {
  callsign: string;
  elo_rating: number;
}

export interface AuthState {
  token: string | null;
  user: AuthUser | null;
  setToken: (token: string | null) => void;
  setUser: (user: AuthUser | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setToken: (token) => set({ token }),
      setUser: (user) => set({ user }),
      logout: () => set({ token: null, user: null }),
    }),
    { name: 'cosmo-auth' },
  ),
);

// Register token getter with httpClient
setAuthTokenProvider(() => useAuthStore.getState().token);
