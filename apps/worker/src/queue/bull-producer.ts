/**
 * BullMQ Job Producer
 * 
 * Publishes normalized tick data to Redis-backed queues
 * for processing by the backend service.
 */

// import { Queue } from 'bullmq';

export class BullProducer {
  // private tickQueue: Queue;

  constructor(private readonly redisUrl: string) {
    // TODO: Initialize BullMQ queue
    // this.tickQueue = new Queue('tick-processing', { connection: { url: redisUrl } });
  }

  async publishTick(tick: unknown): Promise<void> {
    // TODO: Add tick to processing queue
    console.log('📤 Publishing tick to queue...');
  }

  async close(): Promise<void> {
    // TODO: Close queue connection
  }
}
