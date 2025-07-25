export interface Token {
  id: string
  symbol: string
  name: string
  image: string
  price: number
  marketCap: number
  volume24h: number
  change24h: number
  priceData?: PriceData[]
}

export interface PriceData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface User {
  id: string
  address: string
  avatar?: string
  name?: string
  totalVolume: number
  winRate: number
  totalTrades: number
  rank: number
}

export interface WatchlistItem {
  tokenId: string
  addedAt: number
}

export interface Trade {
  id: string
  tokenSymbol: string
  type: 'buy' | 'sell'
  amount: number
  price: number
  timestamp: number
  txHash: string
}

export interface Ranking {
  userId: string
  address: string
  avatar?: string
  name?: string
  value: number
  rank: number
}

export interface WalletBalance {
  tokenId: string
  symbol: string
  name: string
  image: string
  balance: number
  value: number
}

export type NavigationItem = {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

export type TimeFrame = '1m' | '5m' | '15m' | '1h' | '4h' | '1d'