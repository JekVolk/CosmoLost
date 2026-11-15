export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export const WS_URL: string =
  (import.meta.env.VITE_WS_URL as string | undefined) ??
  (typeof window !== 'undefined' && window.location
    ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/game/`
    : 'ws://localhost:8000/ws/game/');
