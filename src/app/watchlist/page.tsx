"use client"

import { formatPercentage } from "@/lib/utils"
import { formatPrice } from '@/datafeed/helpers'
import { TrendingUp, TrendingDown, Star, Plus } from "lucide-react"
import { SearchTokenDrawer } from "@/components/search-token-drawer"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import CreateWalletUI from "@/components/create-wallet-ui"
import LoadingUI from "@/components/loading-ui"
import LoginUI from "@/components/login-ui"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useWatchlist } from "@/hooks/use-watchlist"

export default function WatchlistPage() {

  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets } = useSolanaWallets();
  const { watchlist, handleAddToWatchlist, handleRemoveFromWatchlist } = useWatchlist();


  // Loading state
  if (!ready) {
    return <LoadingUI />
  }

  // Not authenticated - show login UI
  if (!authenticated) {
    return <LoginUI />
  }

  // Authenticated but no wallet - show create wallet UI
  if (authenticated && (!wallets || wallets.length === 0)) {
    return <CreateWalletUI />
  }

  return (
    <div className="container mx-auto px-4 pt-0 pb-20 space-y-3">
      {/* Sticky Header */}
      <div className="sticky top-14 z-40 bg-black/95 backdrop-blur-lg border-b border-gray-800/50 -mx-4 px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
            <h1 className="text-lg font-semibold text-white">My Watchlist</h1>
          </div>
          <SearchTokenDrawer
            onAddToken={handleAddToWatchlist}
            onRemoveToken={handleRemoveFromWatchlist}
            watchlist={watchlist}
          >
            <div className="relative group">
              <button
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 p-[1px] rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <div className="bg-gray-900 hover:bg-gray-800 transition-colors duration-300 rounded-lg px-3 py-1.5 flex items-center gap-1.5">
                  <div className="relative">
                    <Plus className="h-3 w-3 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm group-hover:bg-cyan-400/30 transition-all duration-300"></div>
                  </div>
                  <span className="text-xs font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
                    Add
                  </span>
                </div>
              </button>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          </SearchTokenDrawer>
        </div>
      </div>

      {/* Watchlist */}
      {watchlist.length === 0 ? (
        <div className="text-center py-16">
          <Star className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2 text-white">No tokens in watchlist</h3>
          <p className="text-gray-400 mb-6">
            Start adding tokens to keep track of your favorites
          </p>
          <SearchTokenDrawer
            onAddToken={handleAddToWatchlist}
            onRemoveToken={handleRemoveFromWatchlist}
            watchlist={watchlist}
          >
            <div className="relative group">
              <button
                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 p-[1px] rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <div className="bg-gray-900 hover:bg-gray-800 transition-colors duration-300 rounded-lg px-4 py-2 flex items-center gap-2">
                  <div className="relative">
                    <Plus className="h-4 w-4 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
                    <div className="absolute inset-0 bg-blue-400/20 rounded-full blur-sm group-hover:bg-cyan-400/30 transition-all duration-300"></div>
                  </div>
                  <span className="text-sm font-medium bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-cyan-400 group-hover:to-blue-400 transition-all duration-300">
                    Add Your First Token
                  </span>
                </div>
              </button>
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
            </div>
          </SearchTokenDrawer>
        </div>
      ) : (
        <div className="space-y-2">
          {watchlist.map((token) => (
            <div
              key={token.address}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50 border border-gray-800/50 hover:bg-gray-800/30 transition-all duration-200 cursor-pointer"
            >
              {/* Token Info */}
              <div
                onClick={() => {
                  router.push(`/trade/${token.address}`);
                }}
                className="flex items-center gap-2 flex-1"
              >
                <div className="text-xl relative">
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={32}
                    height={32}
                    className="rounded-full"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                  />
                  <div 
                    className="hidden items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold"
                    style={{ display: 'none' }}
                  >
                    {token.symbol?.slice(0, 2).toUpperCase() || 'TK'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{token.symbol}</div>
                  <div className="text-xs text-gray-400">{token.name}</div>
                </div>
              </div>

              {/* Price & Change */}
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="font-medium text-white text-sm">{formatPrice(token.price)}</div>
                  <div className={`text-xs flex items-center gap-1 justify-end ${token.priceChange24hPercent >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {token.priceChange24hPercent >= 0 ? (
                      <TrendingUp className="h-3 w-3" />
                    ) : (
                      <TrendingDown className="h-3 w-3" />
                    )}
                    {formatPercentage(token.priceChange24hPercent)}
                  </div>
                </div>

                {/* Star Button */}
                <button
                  onClick={() => {
                    handleRemoveFromWatchlist(token.address)
                  }}
                  className="w-8 h-8 rounded-full hover:bg-gray-800/50 transition-colors duration-200 flex items-center justify-center"
                >
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}