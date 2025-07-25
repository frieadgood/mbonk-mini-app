"use client"

import React, { useEffect, useState, useCallback } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Search, Plus, TrendingUp, TrendingDown, Star, Zap, Loader2, ShieldCheck } from "lucide-react"
import { formatPercentage } from "@/lib/utils"
import { formatPrice } from "@/datafeed/helpers"
import { getTrendingTokens, searchTokens } from "@/lib/token"
import { Token, TokenOverview, TokenSearchResult } from "@/types/token"
import Image from "next/image"
import { useRouter } from "next/navigation"

interface SearchTokenDrawerProps {
  children: React.ReactNode
  onAddToken?: (tokenAddress: string) => void
  onRemoveToken?: (tokenAddress: string) => void
  watchlist?: TokenOverview[]
}

export function SearchTokenDrawer({ children, onAddToken, onRemoveToken, watchlist }: SearchTokenDrawerProps) {

  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [trendingTokens, setTrendingTokens] = useState<Token[]>([])
  const [searchResults, setSearchResults] = useState<TokenSearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)

  const watchlistAddresses = watchlist?.map((token: TokenOverview) => token.address);

  const isTokenInWatchlist = (tokenAddress: string) => {
    return watchlistAddresses?.includes(tokenAddress) || false;
  };

  const loadTrendingTokens = async () => {
    const tokens = await getTrendingTokens(1, 10);
    setTrendingTokens(tokens);
  }

  // Debounced search function
  const debouncedSearch = useCallback(
    async (query: string) => {
      if (!query.trim()) {
        setSearchResults([])
        setIsSearching(false)
        setSearchError(null)
        return
      }

      setIsSearching(true)
      setSearchError(null)

      try {
        const result = await searchTokens({
          chain: 'solana',
          keyword: query,
          target: 'token',
          search_mode: 'fuzzy',
          search_by: 'combination',
          sort_by: 'liquidity',
          sort_type: 'desc',
          verify_token: null,
          offset: 0,
          limit: 20
        });

        if (result.error) {
          setSearchError('Failed to search tokens')
          setSearchResults([])
        } else {
          const items = result.data[0].result;
          setSearchResults(items || [])
        }
      } catch {
        setSearchError('Failed to search tokens')
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    },
    []
  )

  // Debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      debouncedSearch(searchQuery)
    }, 500) // 500ms debounce

    return () => clearTimeout(timer)
  }, [searchQuery, debouncedSearch])

  const handleAddToken = (tokenAddress: string) => {
    if (onAddToken) {
      onAddToken(tokenAddress)
    }
    // setOpen(false)
    setSearchQuery("")
  }

  const handleRemoveToken = (tokenAddress: string) => {
    if (onRemoveToken) {
      onRemoveToken(tokenAddress)
    }
    // setOpen(false)
    setSearchQuery("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      setSearchQuery("")
      setSearchResults([])
      setSearchError(null)
      setIsSearching(false)
    }
  }

  useEffect(() => {
    loadTrendingTokens()
  }, [])

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] bg-gray-950/95 backdrop-blur-xl border-t border-gray-800/50 p-0"
      >
        <div className="flex flex-col h-full">
          {/* Header - Search Input Only */}
          <div className="p-4 pt-[40px] border-b border-gray-800/50">
            <div className="relative">
              {/* <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 rounded-xl blur-md opacity-50"></div> */}
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tokens by name or symbol..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-2 bg-gray-900/80 border border-gray-800/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-y-auto p-4 space-y-3">
              {/* Trending Section */}
              {!searchQuery && trendingTokens.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="h-4 w-4 text-orange-400" />
                    <h3 className="font-semibold text-white text-sm">Trending</h3>
                  </div>
                  <div className="grid grid-cols-1 gap-1.5">
                    {trendingTokens.map((token: Token) => (
                      <div
                        key={token.address}
                        className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200 cursor-pointer"
                      >
                        <div
                          className="flex items-center gap-3"
                          onClick={() => { router.push(`/trade/${token.address}`) }}
                        >
                          <div className="text-xl">
                            <Image
                              src={token.logoURI}
                              alt={token.name}
                              width={24}
                              height={24}
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
                              className="hidden w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                              style={{ display: 'none' }}
                            >
                              {token.symbol.slice(0, 2).toUpperCase()}
                            </div>
                          </div>
                          <div>
                            <div className="font-semibold text-white text-sm">{token.symbol}</div>
                            <div className="text-xs text-gray-400">{token.name}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <div className="font-semibold text-white text-sm">{formatPrice(token.price)}</div>
                            <div className={`text-xs flex items-center gap-1 justify-end ${token.price24hChangePercent >= 0 ? 'text-green-400' : 'text-red-400'
                              }`}>
                              {token.price24hChangePercent >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {formatPercentage(token.price24hChangePercent)}
                            </div>
                          </div>

                          <div className="relative group">
                            {isTokenInWatchlist(token.address) ? (
                              <div
                                className="relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-500 p-[1px] rounded-lg cursor-pointer"
                                onClick={() => handleRemoveToken(token.address)}
                              >
                                <div className="bg-gray-900 rounded-lg p-1.5">
                                  <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => handleAddToken(token.address)}
                                className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 p-[1px] rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                              >
                                <div className="bg-gray-900 hover:bg-gray-800 transition-colors duration-300 rounded-lg p-1.5">
                                  <Plus className="h-3.5 w-3.5 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
                                </div>
                              </button>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Search Results */}
              {searchQuery && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="h-4 w-4 text-blue-400" />
                    <h3 className="font-semibold text-white text-sm">
                      Search Results {!isSearching && `(${searchResults.length})`}
                    </h3>
                    {isSearching && <Loader2 className="h-3 w-3 animate-spin text-blue-400" />}
                  </div>

                  {searchError ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-red-400 mx-auto mb-3" />
                      <h3 className="text-base font-semibold mb-2 text-white">Search Error</h3>
                      <p className="text-sm text-gray-400">{searchError}</p>
                    </div>
                  ) : searchResults.length === 0 && !isSearching ? (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                      <h3 className="text-base font-semibold mb-2 text-white">No tokens found</h3>
                      <p className="text-sm text-gray-400">
                        Try adjusting your search terms
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      {searchResults.map((token: TokenSearchResult) => (
                        <div
                          key={token.address}
                          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-gray-900/50 to-gray-800/30 border border-gray-800/50 hover:border-gray-700/50 transition-all duration-200"
                        >
                          <div
                            className="flex items-center gap-3 cursor-pointer"
                            onClick={() => { router.push(`/trade/${token.address}`) }}
                          >
                            <div className="text-xl">
                              {token.logo_uri ? (
                                <>
                                  <Image
                                    src={token.logo_uri}
                                    alt={token.name}
                                    width={24}
                                    height={24}
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
                                    className="hidden w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold"
                                    style={{ display: 'none' }}
                                  >
                                    {token.symbol.slice(0, 2).toUpperCase()}
                                  </div>
                                </>
                              ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold">
                                  {token.symbol.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-1">
                                <span className="font-semibold text-white text-sm">{token.symbol}</span>
                                {token.verified && (
                                  <ShieldCheck className="h-3 w-3 text-blue-400" />
                                )}
                              </div>
                              <div className="text-xs text-gray-400">{token.name}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="font-semibold text-white text-sm">{formatPrice(token.price)}</div>
                              {token.price_change_24h_percent && (
                                <div className={`text-xs flex items-center gap-1 justify-end ${token.price_change_24h_percent >= 0 ? 'text-green-400' : 'text-red-400'
                                  }`}>
                                  {token.price_change_24h_percent >= 0 ? (
                                    <TrendingUp className="h-3 w-3" />
                                  ) : (
                                    <TrendingDown className="h-3 w-3" />
                                  )}
                                  {formatPercentage(token.price_change_24h_percent)}
                                </div>
                              )}
                            </div>

                            <div className="relative group">
                              {isTokenInWatchlist(token.address) ? (
                                <div className="relative overflow-hidden bg-gradient-to-r from-yellow-500 to-orange-500 p-[1px] rounded-lg">
                                  <div className="bg-gray-900 rounded-lg p-1.5">
                                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => handleAddToken(token.address)}
                                  className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-cyan-500 p-[1px] rounded-lg transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25"
                                >
                                  <div className="bg-gray-900 hover:bg-gray-800 transition-colors duration-300 rounded-lg p-1.5">
                                    <Plus className="h-3.5 w-3.5 text-blue-400 group-hover:text-cyan-400 transition-colors duration-300" />
                                  </div>
                                </button>
                              )}
                              <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-cyan-500/20 rounded-lg blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}