import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { wsClient } from './ws-client';

class MockWebSocket {
  static readonly CONNECTING = 0;
  static readonly OPEN = 1;
  static readonly CLOSING = 2;
  static readonly CLOSED = 3;

  static instances: MockWebSocket[] = [];

  readonly CONNECTING = 0;
  readonly OPEN = 1;
  readonly CLOSING = 2;
  readonly CLOSED = 3;

  readyState: number = MockWebSocket.OPEN;
  url: string;
  sentMessages: string[] = [];
  onmessage: ((event: { data: string }) => void) | null = null;
  onclose: (() => void) | null = null;

  constructor(url: string) {
    this.url = url;
    MockWebSocket.instances.push(this);
  }

  send(data: string) {
    this.sentMessages.push(data);
  }

  close() {
    this.readyState = MockWebSocket.CLOSED;
    this.onclose?.();
  }
}

describe('wsClient', () => {
  const originalWebSocket = globalThis.WebSocket;

  beforeEach(() => {
    MockWebSocket.instances = [];
    globalThis.WebSocket = MockWebSocket as unknown as typeof WebSocket;
    wsClient.disconnect();
  });

  afterEach(() => {
    wsClient.disconnect();
    globalThis.WebSocket = originalWebSocket;
  });

  it('connects and creates singleton socket', () => {
    wsClient.connect('/ws/game/');
    expect(MockWebSocket.instances.length).toBe(1);

    // Calling connect again while open should not create a new socket
    wsClient.connect('/ws/game/');
    expect(MockWebSocket.instances.length).toBe(1);
  });

  it('sends action and fields as JSON when connected', () => {
    wsClient.connect('/ws/game/');
    const socket = MockWebSocket.instances[0];

    wsClient.send('submit_guess', { lat: 10.5, lon: 20.3 });

    expect(socket.sentMessages.length).toBe(1);
    expect(JSON.parse(socket.sentMessages[0])).toEqual({
      action: 'submit_guess',
      lat: 10.5,
      lon: 20.3,
    });
  });

  it('dispatches incoming events to subscribed listeners', () => {
    wsClient.connect('/ws/game/');
    const socket = MockWebSocket.instances[0];

    const matchCallback = vi.fn();
    const unsub = wsClient.on('game.matched', matchCallback);

    // Simulate incoming message
    socket.onmessage?.({
      data: JSON.stringify({
        event: 'game.matched',
        match_id: 'match-123',
        opponent: { callsign: 'AstroBot', elo: 1200, is_bot: true },
      }),
    });

    expect(matchCallback).toHaveBeenCalledTimes(1);
    expect(matchCallback).toHaveBeenCalledWith({
      event: 'game.matched',
      match_id: 'match-123',
      opponent: { callsign: 'AstroBot', elo: 1200, is_bot: true },
    });

    // Unsubscribe and verify no more calls
    unsub();

    socket.onmessage?.({
      data: JSON.stringify({
        event: 'game.matched',
        match_id: 'match-456',
      }),
    });

    expect(matchCallback).toHaveBeenCalledTimes(1);
  });

  it('disconnects and resets socket', () => {
    wsClient.connect('/ws/game/');
    const socket = MockWebSocket.instances[0];

    expect(wsClient.getSocket()).not.toBeNull();
    wsClient.disconnect();

    expect(socket.readyState).toBe(MockWebSocket.CLOSED);
    expect(wsClient.getSocket()).toBeNull();
  });
});
