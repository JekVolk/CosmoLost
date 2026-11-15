export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined) ?? '';

export const WS_URL: string = (import.meta.env.VITE_WS_URL as string | undefined) ?? '/ws/game/';
