/**
 * Price Feed WebSocket Gateway
 * 
 * Broadcasts real-time commodity price updates to connected clients
 * via Socket.io.
 */

import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import Redis from 'ioredis';

@WebSocketGateway({
  cors: {
    origin: '*', // Set to specific frontend URL in production
  },
})
export class PriceFeedGateway implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit {
  @WebSocketServer() 
  server: Server;

  private redisSubscriber: Redis;

  afterInit() {
    this.redisSubscriber = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');
    this.redisSubscriber.subscribe('market:ticks', (err, count) => {
      if (err) {
        console.error('Failed to subscribe to Redis:', err.message);
      } else {
        console.log(`Subscribed to ${count} Redis channels. (market:ticks)`);
      }
    });

    this.redisSubscriber.on('message', (channel, message) => {
      if (channel === 'market:ticks') {
        try {
          const tickData = JSON.parse(message);
          this.broadcastTick(tickData.assetId, tickData);
        } catch (e) {
          console.error('Invalid tick data via Redis:', e);
        }
      }
    });
  }

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe-ticker')
  handleSubscribe(client: Socket, payload: { assetIds: string[] }) {
    if (payload && Array.isArray(payload.assetIds)) {
      payload.assetIds.forEach((id) => client.join(`ticker:${id}`));
      console.log(`Client ${client.id} subscribed to [${payload.assetIds.join(', ')}]`);
    }
  }

  @SubscribeMessage('unsubscribe-ticker')
  handleUnsubscribe(client: Socket, payload: { assetIds: string[] }) {
    if (payload && Array.isArray(payload.assetIds)) {
      payload.assetIds.forEach((id) => client.leave(`ticker:${id}`));
      console.log(`Client ${client.id} unsubscribed from [${payload.assetIds.join(', ')}]`);
    }
  }

  /**
   * Called by the internal background worker/message queue
   * when a new tick is received from an external API or broker.
   */
  broadcastTick(assetId: string, data: any) {
    this.server.to(`ticker:${assetId}`).emit('tick', data);
  }
}
