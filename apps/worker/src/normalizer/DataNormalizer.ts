import { NormalizedTick } from '@quantpulse/shared';
// In a real scenario, this normalizer would take disparate schemas from different WS/API
// and convert them. Here it just acts as a pass-through/enricher since connectors already mock it.

export class DataNormalizer {
  static normalize(rawTick: any): NormalizedTick {
    // Enforcement of schema and custom enrichment
    return {
      assetId: String(rawTick.assetId),
      priceINR: Number(rawTick.priceINR),
      priceUSD: Number(rawTick.priceUSD),
      open: Number(rawTick.open || rawTick.priceINR),
      high: Number(rawTick.high || rawTick.priceINR),
      low: Number(rawTick.low || rawTick.priceINR),
      close: Number(rawTick.close || rawTick.priceINR),
      volume: Number(rawTick.volume || 0),
      percentChange: Number(rawTick.percentChange || 0),
      sourceProvider: rawTick.sourceProvider || 'UNKNOWN',
      interval: rawTick.interval || 'raw',
      timestamp: new Date(rawTick.timestamp || Date.now()),
    };
  }
}
