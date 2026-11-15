import { ENV } from '../config/env';

type Listener = (payload: unknown) => void;

class WsClient {
  private socket: WebSocket | null = null;
  private listeners: Map<string, Set<Listener>> = new Map();

  connect(token?: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) return;

    const authToken = token || localStorage.getItem('cosmo_access_token') || 'anonymous';
    const url = `${ENV.WS_URL}/ws/game/?token=${authToken}`;

    this.socket = new WebSocket(url);

    this.socket.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const callbacks = this.listeners.get(data.type);
        if (callbacks) {
          for (const cb of callbacks) cb(data.payload);
        }
      } catch (err) {
        console.error('WS parse error:', err);
      }
    };

    this.socket.onerror = (err) => {
      console.warn('WS error:', err);
    };

    this.socket.onclose = () => {
      this.socket = null;
    };
  }

  send(type: string, payload: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify({ type, payload }));
    }
  }

  on(type: string, listener: Listener): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);

    return () => {
      this.listeners.get(type)?.delete(listener);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }
}

export const wsClient = new WsClient();
