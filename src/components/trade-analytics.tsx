"use client"

import React, { useState } from "react"
import { BarChart3, ChevronDown, TrendingUp, TrendingDown, Activity, DollarSign } from "lucide-react"
import { formatNumber, formatMarketCap } from "@/lib/utils"
import { TokenOverview } from "@/types/token"

interface TradeAnalyticsProps {
  tokenData: TokenOverview
}

type TimeFrame = '30m' | '1h' | '4h' | '24h'

const timeFrameLabels = {
  '30m': '30 Minutes',
  '1h': '1 Hour', 
  '4h': '4 Hours',
  '24h': '24 Hours'
}

export function TradeAnalytics({ tokenData }: TradeAnalyticsProps) {
  const [selectedTimeFrame, setSelectedTimeFrame] = useState<TimeFrame>('24h')

  // Get data based on selected timeframe
  const getTimeFrameData = (timeFrame: TimeFrame) => {
    switch (timeFrame) {
      case '30m':
        return {
          buyCount: tokenData.buy30m || 0,
          sellCount: tokenData.sell30m || 0,
          buyVolume: tokenData.vBuy30mUSD || 0,
          sellVolume: tokenData.vSell30mUSD || 0,
          totalTrades: tokenData.trade30m || 0,
          totalVolume: tokenData.v30mUSD || 0
        }
      case '1h':
        return {
          buyCount: tokenData.buy1h || 0,
          sellCount: tokenData.sell1h || 0,
          buyVolume: tokenData.vBuy1hUSD || 0,
          sellVolume: tokenData.vSell1hUSD || 0,
          totalTrades: tokenData.trade1h || 0,
          totalVolume: tokenData.v1hUSD || 0
        }
      case '4h':
        return {
          buyCount: tokenData.buy4h || 0,
          sellCount: tokenData.sell4h || 0,
          buyVolume: tokenData.vBuy4hUSD || 0,
          sellVolume: tokenData.vSell4hUSD || 0,
          totalTrades: tokenData.trade4h || 0,
          totalVolume: tokenData.v4hUSD || 0
        }
      case '24h':
        return {
          buyCount: tokenData.buy24h || 0,
          sellCount: tokenData.sell24h || 0,
          buyVolume: tokenData.vBuy24hUSD || 0,
          sellVolume: tokenData.vSell24hUSD || 0,
          totalTrades: tokenData.trade24h || 0,
          totalVolume: tokenData.v24hUSD || 0
        }
      default:
        return {
          buyCount: 0,
          sellCount: 0,
          buyVolume: 0,
          sellVolume: 0,
          totalTrades: 0,
          totalVolume: 0
        }
    }
  }

  const data = getTimeFrameData(selectedTimeFrame)
  
  // Calculate percentages
  const buyCountPercentage = data.totalTrades > 0 ? (data.buyCount / data.totalTrades) * 100 : 0
  const sellCountPercentage = data.totalTrades > 0 ? (data.sellCount / data.totalTrades) * 100 : 0
  const buyVolumePercentage = data.totalVolume > 0 ? (data.buyVolume / data.totalVolume) * 100 : 0
  const sellVolumePercentage = data.totalVolume > 0 ? (data.sellVolume / data.totalVolume) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Header with Time Frame Selector */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Buy / Sell</h3>
        </div>
        <div className="relative">
          <select
            value={selectedTimeFrame}
            onChange={(e) => setSelectedTimeFrame(e.target.value as TimeFrame)}
            className="w-28 px-2 py-1.5 bg-gray-900/50 border border-gray-700/50 text-white text-xs rounded-md appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent"
          >
            {Object.entries(timeFrameLabels).map(([key, label]) => (
              <option key={key} value={key} className="bg-gray-900 text-white">
                {label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-1.5 top-1/2 transform -translate-y-1/2 h-3 w-3 text-gray-400 pointer-events-none" />
        </div>
      </div>

      {/* Trade Count Analysis */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-800/50">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Transaction Distribution</span>
          </div>
          
          {/* Buy/Sell Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-400">Buy</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-green-400">
                  {formatNumber(data.buyCount)}
                </span>
                <span className="text-xs text-green-400 ml-1">
                  ({buyCountPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-3 w-3 text-red-400" />
                <span className="text-xs text-gray-400">Sell</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-red-400">
                  {formatNumber(data.sellCount)}
                </span>
                <span className="text-xs text-red-400 ml-1">
                  ({sellCountPercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
          
          {/* Unified Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-400 transition-all duration-500 ease-out"
                style={{ width: `${buyCountPercentage}%` }}
              />
              <div 
                className="bg-red-400 transition-all duration-500 ease-out"
                style={{ width: `${sellCountPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Volume Analysis */}
      <div className="space-y-3">
        <div className="p-4 rounded-lg bg-gray-900/30 border border-gray-800/50">
          {/* Header */}
          <div className="flex items-center gap-2 mb-3">
            <DollarSign className="h-4 w-4 text-blue-400" />
            <span className="text-sm font-medium text-white">Volume Distribution</span>
          </div>
          
          {/* Buy/Sell Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-400">Buy</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-green-400">
                  {formatMarketCap(data.buyVolume)}
                </span>
                <span className="text-xs text-green-400 ml-1">
                  ({buyVolumePercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingDown className="h-3 w-3 text-red-400" />
                <span className="text-xs text-gray-400">Sell</span>
              </div>
              <div className="text-right">
                <span className="text-sm font-semibold text-red-400">
                  {formatMarketCap(data.sellVolume)}
                </span>
                <span className="text-xs text-red-400 ml-1">
                  ({sellVolumePercentage.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>
          
          {/* Unified Progress Bar */}
          <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
            <div className="h-full flex">
              <div 
                className="bg-green-400 transition-all duration-500 ease-out"
                style={{ width: `${buyVolumePercentage}%` }}
              />
              <div 
                className="bg-red-400 transition-all duration-500 ease-out"
                style={{ width: `${sellVolumePercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

    </div>
  )
}