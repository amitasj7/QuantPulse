import { io, Socket } from 'socket.io-client';
import { NormalizedTick } from '@quantpulse/shared';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || (typeof window !== 'undefined' ? '' : 'http://quantpulse-backend:4000');

class SocketClient {
  public socket: Socket | null = null;
  private listeners: Set<(tick: NormalizedTick) => void> = new Set();

  connect() {
    if (!this.socket) {
      this.socket = io(WS_URL, {
        reconnectionDelayMax: 10000,
      });

      this.socket.on('connect', () => {
        console.log('Connected to QuantPulse Live Market Socket');
      });

      this.socket.on('tick', (data: NormalizedTick) => {
        this.listeners.forEach((fn) => fn(data));
      });
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  subscribe(assetIds: string[]) {
    if (this.socket) {
      this.socket.emit('subscribe-ticker', { assetIds });
    }
  }

  unsubscribe(assetIds: string[]) {
    if (this.socket) {
      this.socket.emit('unsubscribe-ticker', { assetIds });
    }
  }

  onTick(callback: (tick: NormalizedTick) => void) {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }
}

export const socketClient = new SocketClient();
