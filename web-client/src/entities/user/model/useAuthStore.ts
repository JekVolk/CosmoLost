import { create } from 'zustand';

export interface UserProfile {
  id: number;
  callsign: string;
  avatar_url: string | null;
  elo: number;
  rp_balance: number;
  win_streak: number;
  container_slots: number;
}

interface AuthState {
  token: string | null;
  user: UserProfile | null;
  isAuthenticated: boolean;
  setAuth: (token: string, user: UserProfile) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: localStorage.getItem('cosmo_access_token'),
  user: null,
  isAuthenticated: !!localStorage.getItem('cosmo_access_token'),
  setAuth: (token, user) => {
    localStorage.setItem('cosmo_access_token', token);
    set({ token, user, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('cosmo_access_token');
    set({ token: null, user: null, isAuthenticated: false });
  },
}));
