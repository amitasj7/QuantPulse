-- Enable TimescaleDB extension
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- CreateTable
CREATE TABLE "commodities" (
    "id" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "exchange" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commodities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT NOT NULL,
    "priceINR" DOUBLE PRECISION NOT NULL,
    "priceUSD" DOUBLE PRECISION NOT NULL,
    "open" DOUBLE PRECISION,
    "high" DOUBLE PRECISION,
    "low" DOUBLE PRECISION,
    "close" DOUBLE PRECISION,
    "volume" DOUBLE PRECISION,
    "percentChange" DOUBLE PRECISION,
    "sourceProvider" TEXT NOT NULL,
    "interval" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id","timestamp")
);

-- CreateTable
CREATE TABLE "commodity_news" (
    "id" TEXT NOT NULL,
    "commodityId" TEXT,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "sourceUrl" TEXT NOT NULL,
    "sourceName" TEXT NOT NULL,
    "sentiment" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commodity_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "forex_rates" (
    "id" TEXT NOT NULL,
    "pair" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "forex_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commodities_assetId_key" ON "commodities"("assetId");

-- CreateIndex
CREATE INDEX "price_history_commodityId_timestamp_idx" ON "price_history"("commodityId", "timestamp");

-- CreateIndex
CREATE INDEX "price_history_timestamp_idx" ON "price_history"("timestamp");

-- CreateIndex
CREATE INDEX "commodity_news_commodityId_publishedAt_idx" ON "commodity_news"("commodityId", "publishedAt");

-- CreateIndex
CREATE INDEX "forex_rates_pair_timestamp_idx" ON "forex_rates"("pair", "timestamp");

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commodity_news" ADD CONSTRAINT "commodity_news_commodityId_fkey" FOREIGN KEY ("commodityId") REFERENCES "commodities"("id") ON DELETE SET NULL ON UPDATE CASCADE;
