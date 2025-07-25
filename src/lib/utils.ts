import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(price: number): string {
  if (price >= 1_000_000_000) {
    return `$${(price / 1_000_000_000).toFixed(2)}B`
  } else if (price >= 1_000_000) {
    return `$${(price / 1_000_000).toFixed(2)}M`
  } else if (price >= 1_000) {
    return `$${(price / 1_000).toFixed(2)}K`
  } else {
    return `$${price.toFixed(2)}`
  }
}

export function formatMarketCap(marketCap: number): string {
  if (marketCap >= 1_000_000_000) {
    return `$${(marketCap / 1_000_000_000).toFixed(2)}B`
  } else if (marketCap >= 1_000_000) {
    return `$${(marketCap / 1_000_000).toFixed(2)}M`
  } else if (marketCap >= 1_000) {
    return `$${(marketCap / 1_000).toFixed(2)}K`
  } else {
    return `$${marketCap.toFixed(2)}`
  }
}

export function formatPercentage(percentage: number): string {
  const sign = percentage >= 0 ? "+" : ""
  return `${sign}${percentage.toFixed(2)}%`
}

export function formatNumber(num: number, decimals = 2, forceToFixed = true) {
  if (num === null || num === undefined || isNaN(num)) {
    return '0';
  }

  // Define suffixes and their corresponding values
  const suffixes = [
    { value: 1e12, symbol: 'T' },
    { value: 1e9, symbol: 'B' },
    { value: 1e6, symbol: 'M' },
    { value: 1e3, symbol: 'K' }
  ];

  // Handle negative numbers
  const isNegative = num < 0;
  num = Math.abs(num);

  // Find the appropriate suffix
  for (const { value, symbol } of suffixes) {
    if (num >= value) {
      // Calculate the formatted number
      const formatted = (num / value).toFixed(decimals);
      // Remove trailing zeros after decimal point
      const cleanFormatted = formatted.replace(/\.?0+$/, '');
      return `${isNegative ? '-' : ''}${cleanFormatted}${symbol}`;
    }
  }

  // If number is smaller than 1000, just return it as is
  return `${isNegative ? '-' : ''}${forceToFixed ? num.toFixed(decimals) : num}`;
}

export function truncateAddress(address: string, chars = 4): string {
  if (!address) return ""
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`
}