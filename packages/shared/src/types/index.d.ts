export interface NormalizedTick {
    assetId: string;
    priceINR: number;
    priceUSD: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
    percentChange: number;
    sourceProvider: 'BROKER' | 'GLOBAL_API';
    interval: string;
    timestamp: Date;
}
//# sourceMappingURL=index.d.ts.map