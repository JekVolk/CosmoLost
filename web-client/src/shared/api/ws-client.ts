// Singleton WebSocket manager
let socket: WebSocket | null = null;
const listeners = new Map<string, Set<(data: unknown) => void>>();

export const wsClient = {
  connect(wsUrl: string): void {
    if (socket && socket.readyState === WebSocket.OPEN) {
      return;
    }

    let resolvedUrl: string;
    if (typeof window !== 'undefined' && window.location) {
      const url = new URL(wsUrl, window.location.href);
      url.protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      resolvedUrl = url.toString();
    } else {
      resolvedUrl = wsUrl;
    }

    socket = new WebSocket(resolvedUrl);

    socket.onmessage = (event: MessageEvent) => {
      try {
        const msg = (typeof event.data === 'string' ? JSON.parse(event.data) : event.data) as {
          event: string;
          [key: string]: unknown;
        };

        if (msg && typeof msg.event === 'string') {
          const callbacks = listeners.get(msg.event);
          if (callbacks) {
            for (const cb of callbacks) {
              cb(msg);
            }
          }
        }
      } catch {
        // ignore parse error for non-json frames
      }
    };
  },

  send(action: string, fields: Record<string, unknown> = {}): void {
    if (socket && socket.readyState === WebSocket.OPEN) {
      socket.send(JSON.stringify({ action, ...fields }));
    }
  },

  on(event: string, cb: (data: unknown) => void): () => void {
    let set = listeners.get(event);
    if (!set) {
      set = new Set();
      listeners.set(event, set);
    }
    set.add(cb);

    return () => {
      listeners.get(event)?.delete(cb);
    };
  },

  disconnect(): void {
    if (socket) {
      socket.close();
      socket = null;
    }
  },

  getSocket(): WebSocket | null {
    return socket;
  },
};
