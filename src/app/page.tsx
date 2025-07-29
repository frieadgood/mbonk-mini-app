"use client"

import LoadingUI from "@/components/loading-ui"
import { Button } from "@/components/ui/button"
import { getTokenOverview, getTrendingTokens } from "@/lib/token"
import { formatPrice } from "@/datafeed/helpers"
import { formatMarketCap, formatPercentage } from "@/lib/utils"
import { Token, TokenOverview } from "@/types/token"
import { usePrivy } from "@privy-io/react-auth"
import { TrendingUp, TrendingDown, Flame } from "lucide-react"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"

export default function Home() {

  const { ready, login, authenticated } = usePrivy();
  const router = useRouter();
  // isLoading
  const [isLoading, setIsLoading] = useState(true);
  const loadHomePageDataRef = useRef(false);
  // Trending tokens
  const [trendingTokens, setTrendingTokens] = useState<Token[]>([]);
  // Project token
  const [projectToken, setProjectToken] = useState<TokenOverview>({} as TokenOverview);

  const loadHomePageData = async () => {
    const token = await getTokenOverview(process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS as string);
    if (token.data) {
      setProjectToken(token.data as TokenOverview);
    }
    const trendingTokens = await getTrendingTokens(1, 10);
    setTrendingTokens(trendingTokens);
  }

  useEffect(() => {
    if (loadHomePageDataRef.current) return;
    loadHomePageDataRef.current = true;

    loadHomePageData().finally(() => {
      setIsLoading(false);
    });
  }, []);

  if (!ready || isLoading) {
    return <LoadingUI />
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Project Token Info */}
      {projectToken.address && (
        <div className="relative p-6 rounded-2xl bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80 border border-gray-800/50 backdrop-blur-sm">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Image src={projectToken.logoURI || '/logo.png'} alt={projectToken.name} width={48} height={48} className="rounded-full" />
              <div>
                <h1 className="text-xl font-bold text-white">{projectToken.symbol}</h1>
                <p className="text-sm text-gray-400">{projectToken.name}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-white">{formatPrice(projectToken.price)}</div>
              <div className={`flex items-center gap-1 justify-end ${projectToken.priceChange24hPercent >= 0 ? 'text-green-400' : 'text-red-400'
                }`}>
                {projectToken.priceChange24hPercent >= 0 ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span className="font-semibold">{formatPercentage(projectToken.priceChange24hPercent)}</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">Market Cap</div>
              <div className="text-lg font-bold text-white">{formatMarketCap(projectToken.marketCap)}</div>
            </div>
            <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
              <div className="text-xs text-gray-400 mb-1">24h Volume</div>
              <div className="text-lg font-bold text-white">{formatMarketCap(projectToken.v24hUSD)}</div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-300 mb-6 leading-relaxed">
            {projectToken.extensions?.description || 'No description available'}
          </p>

          {/* Action Button */}
          <Button
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl transition-all duration-200"
            onClick={() => {
              if (!authenticated) {
                login();
              } else {
                router.push(`/trade/${projectToken.address}`);
              }
            }}
          >
            Trade ${projectToken.symbol}
          </Button>

          {/* Background glow effect */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-blue-500/5 opacity-50 pointer-events-none"></div>
        </div>
      )}

      {/* Trending Tokens */}
      <div className="space-y-4">
        {/* Title Section */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h2 className="text-base font-semibold text-white">Trending Now</h2>
          </div>
          {/* <Button
            variant="ghost"
            size="sm"
            className="text-gray-400 hover:text-white text-sm h-8 px-2"
          >
            More
            <ChevronRight className="h-3 w-3 ml-1" />
          </Button> */}
        </div>

        {/* Tokens List */}
        <div className="space-y-2">
          {trendingTokens.map((token) => (
            <div
              key={token.address}
              className="group relative p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/5 cursor-pointer"
              onClick={() => {
                router.push(`/trade/${token.address}`);
              }}
            >
              {/* Token Info & Price */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="text-xl">
                    <Image src={token.logoURI || '/logo.png'} alt={token.name} width={32} height={32} className="rounded-full" />
                  </div>
                  <div>
                    <div className="font-medium text-white text-sm">{token.symbol}</div>
                    <div className="text-xs text-gray-400">{token.name}</div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-white text-sm">{formatPrice(token.price, 6)}</div>
                  <div className={`text-xs flex items-center gap-1 justify-end font-medium ${token.price24hChangePercent >= 0
                    ? 'text-green-400'
                    : 'text-red-400'
                    }`}>
                    {token.price24hChangePercent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatPercentage(token.price24hChangePercent)}
                  </div>
                </div>
              </div>

              {/* Bottom Stats */}
              <div className="flex items-center justify-between text-xs text-gray-400 pt-1.5 border-t border-gray-800/50">
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Rank:</span>
                  <span className="font-medium">#{token.rank}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Vol:</span>
                  <span className="font-medium">{formatMarketCap(token.volume24hUSD)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500">Liq:</span>
                  <span className="font-medium">{formatMarketCap(token.liquidity)}</span>
                </div>
              </div>

              {/* Subtle glow effect */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-orange-500/0 via-red-500/0 to-orange-500/0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
