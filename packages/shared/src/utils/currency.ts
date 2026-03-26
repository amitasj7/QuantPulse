/**
 * Currency Conversion Utilities
 */

export function inrToUsd(inr: number, rate: number): number {
  return Number((inr / rate).toFixed(4));
}

export function usdToInr(usd: number, rate: number): number {
  return Number((usd * rate).toFixed(2));
}

export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount);
}

export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
}

export function formatPercentage(value: number): string {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
}
