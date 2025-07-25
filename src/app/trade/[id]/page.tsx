"use client"

import TradingViewChart from "@/components/tradingview-chart"
import { Button } from "@/components/ui/button"
import { getTokenOverview } from "@/lib/token"
import { formatMarketCap, formatNumber } from "@/lib/utils"
import { formatPrice, getCookies } from "@/datafeed/helpers"
import { TokenOverview } from "@/types/token"
import { Star, StarOff, Search, Copy, MoreHorizontal } from "lucide-react"
import Image from "next/image"
import { useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { SearchTokenDrawer } from "@/components/search-token-drawer"
import { TradeAnalytics } from "@/components/trade-analytics"
import { TradeSecurity } from "@/components/trade-security"
import { TokenDetailInfo } from "@/components/token-detail-info"
import { useWatchlist } from "@/hooks/use-watchlist"
import { useRecoilState } from "recoil"
import { selectedTimeframeAtom } from "@/state/tradingview-chart"
import LoadingUI from "@/components/loading-ui"
import { TradeDrawer } from "@/components/trade-drawer"
import { TransactionList } from "@/components/transaction-list"
import { TokenPosition } from "@/components/token-position"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import { WalletTransaction, WalletTokenPnl } from "@/types/wallet"
import { getWalletTransactions, getWalletTokenPnl } from "@/lib/wallet"
import { tokenPriceAtom } from "@/state/token"

// Define available timeframes
const timeframes = [
  { label: "1m", value: "1" },
  { label: "5m", value: "5" },
  { label: "15m", value: "15" },
  { label: "1h", value: "60" },
  { label: "4h", value: "240" },
  { label: "1D", value: "1D" },
];

export default function TradePage() {

  // privy
  const { ready, authenticated, login } = usePrivy();
  const { wallets } = useSolanaWallets();
  // get token address from url
  const { id } = useParams();
  const tokenAddress = id as string;
  // loading
  const [isLoading, setIsLoading] = useState(true);
  // token data
  const [tokenData, setTokenData] = useState<TokenOverview>({} as TokenOverview);
  const [tokenPrice, setTokenPrice] = useRecoilState(tokenPriceAtom);
  // watchlist
  const { watchlist, handleAddToWatchlist, handleRemoveFromWatchlist } = useWatchlist();
  const isTokenInWatchlist = watchlist.some((token: TokenOverview) => token.address === tokenAddress);
  // selected timeframe
  const [selectedTimeframe, setSelectedTimeframe] = useRecoilState(selectedTimeframeAtom);

  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [activeTab, setActiveTab] = useState('Details')
  const [isTradeDrawerOpen, setIsTradeDrawerOpen] = useState(false)
  const [transactions, setTransactions] = useState<WalletTransaction[]>([])
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false)
  const [tokenPnl, setTokenPnl] = useState<WalletTokenPnl | null>(null)
  const [isLoadingPnl, setIsLoadingPnl] = useState(false)

  const copyTokenAddress = () => {
    navigator.clipboard.writeText(tokenData.address)
  }

  useEffect(() => {
    if (tokenAddress && tokenAddress !== '') {
      const loadTokenData = async () => {
        const token = await getTokenOverview(tokenAddress);
        if (token.data) {
          setTokenData(token.data as TokenOverview);
        }
      }
      loadTokenData().finally(() => {
        setIsLoading(false);
      })
    }
  }, [tokenAddress]);

  useEffect(() => {

    const fetchLatestPrice = async () => {
      const latestPrice = getCookies('latest_price');
      if (latestPrice) {
        setTokenPrice(parseFloat(latestPrice));
      }
    }
    fetchLatestPrice();

    const interval = setInterval(fetchLatestPrice, 500);
    return () => clearInterval(interval);

  }, [setTokenPrice]);

  // Load transactions when user is authenticated and transaction tab is active
  useEffect(() => {
    if (ready && authenticated && wallets.length > 0 && activeTab === 'Transactions') {
      setIsLoadingTransactions(true)
      getWalletTransactions(wallets[0].address, tokenAddress).then((res) => {
        if (res.data) {
          setTransactions(res.data)
        }
      }).finally(() => {
        setIsLoadingTransactions(false)
      })
    }
  }, [ready, authenticated, wallets, activeTab, tokenAddress])

  // Load PnL data when user is authenticated and positions tab is active
  useEffect(() => {
    if (ready && authenticated && wallets.length > 0 && activeTab === 'Positions') {
      setIsLoadingPnl(true)
      getWalletTokenPnl(wallets[0].address, tokenAddress).then((res) => {
        if (res.data) {
          setTokenPnl(res.data)
        } else {
          setTokenPnl(null)
        }
      }).finally(() => {
        setIsLoadingPnl(false)
      })
    }
  }, [ready, authenticated, wallets, activeTab, tokenAddress])

  if (isLoading) {
    return <LoadingUI />
  }

  return (
    <div className="min-h-screen bg-black pb-40 flex flex-col">
      {/* Header Row - Token Info & Stats */}
      {tokenData.address && (
        <div className="bg-black border-b border-gray-800/50">
          <div className="py-3">
            <div className="flex items-center justify-between px-3 mb-2">
              {/* Left - Token Info */}
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    if (isTokenInWatchlist) {
                      handleRemoveFromWatchlist(tokenData.address);
                    } else {
                      handleAddToWatchlist(tokenData.address);
                    }
                  }}
                  className="h-6 w-6 hover:bg-gray-800/50 p-0"
                >
                  {isTokenInWatchlist ? (
                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  ) : (
                    <StarOff className="h-5 w-5 text-gray-400" />
                  )}
                </Button>

                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                  <Image 
                    src={tokenData.logoURI} 
                    alt={tokenData.name} 
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
                    {tokenData.symbol?.slice(0, 2).toUpperCase() || 'TK'}
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1">
                    <h1 className="text-base font-bold text-white">{tokenData.symbol}</h1>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyTokenAddress}
                      className="h-4 w-4 hover:bg-gray-800/50 p-0"
                    >
                      <Copy className="h-3 w-3 text-gray-400" />
                    </Button>
                  </div>
                  <p className="text-xs text-gray-400">{tokenData.name}</p>
                </div>
              </div>

              {/* Right - Price */}
              <div className="text-right">
                <div className="text-base font-bold text-white">{formatPrice(tokenPrice > 0 ? tokenPrice : tokenData.price)}</div>
                {/* <div className={`flex items-center gap-1 justify-end text-xs ${tokenData.priceChange24hPercent >= 0 ? 'text-green-400' : 'text-red-400'
                  }`}>
                  {tokenData.priceChange24hPercent >= 0 ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  <span className="font-medium">{formatPercentage(tokenData.priceChange24hPercent)}</span>
                </div> */}
              </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 text-center text-xs border-t border-gray-800/60 pt-3">
              <div>
                <div className="text-gray-400">Market Cap</div>
                <div className="text-white font-medium">{formatMarketCap(tokenData.marketCap)}</div>
              </div>
              <div>
                <div className="text-gray-400">24h Volume</div>
                <div className="text-white font-medium">{formatMarketCap(tokenData.v24hUSD)}</div>
              </div>
              <div>
                <div className="text-gray-400">Holders</div>
                <div className="text-white font-medium">{formatNumber(tokenData.holder)}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* K-Line Chart - Full Screen */}
      <div className="flex-1 bg-black">
        <div className="h-full flex flex-col">
          {/* Chart Controls */}
          <div className="flex justify-between items-center py-2 px-3 border-b border-gray-800/30">
            <div className="flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] mr-4">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.value}
                  className={`min-w-[40px] px-2 py-1 rounded text-xs font-medium transition-all whitespace-nowrap ${timeframe.value === selectedTimeframe
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white'
                    }`}
                  onClick={() => setSelectedTimeframe(timeframe.value)}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <SearchTokenDrawer
                onAddToken={handleAddToWatchlist}
                watchlist={watchlist}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-gray-800/50"
                >
                  <Search className="h-4 w-4 text-gray-400" />
                </Button>
              </SearchTokenDrawer>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowMoreOptions(!showMoreOptions)}
                className="h-8 w-8 hover:bg-gray-800/50"
              >
                <MoreHorizontal className="h-4 w-4 text-gray-400" />
              </Button>
            </div>
          </div>

          {/* Chart Area */}
          {tokenData.address && (
            <div className="flex-1 flex items-center justify-center">
              <TradingViewChart symbol={tokenData.address} />
            </div>
          )}
        </div>
      </div>

      {/* TabList */}
      <div className="bg-black">
        <div className="flex items-center">
          {['Details', 'Positions', 'Transactions'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium transition-colors relative ${activeTab === tab
                ? 'text-white'
                : 'text-gray-400 hover:text-white'
                }`}
            >
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 bg-black p-4">
        {activeTab === 'Details' && tokenData.address && (
          <div className="text-white space-y-6">
            <TradeAnalytics tokenData={tokenData} />
            <TradeSecurity tokenAddress={tokenData.address} />
            <TokenDetailInfo tokenData={tokenData} />
          </div>
        )}
        {activeTab === 'Positions' && (
          <div className="text-white">
            {!ready || !authenticated ? (
              <div className="text-center py-8">
                <p className="text-gray-400 mb-4">Please connect your wallet to view your positions.</p>
                <Button
                  onClick={login}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
                >
                  Connect Wallet
                </Button>
              </div>
            ) : isLoadingPnl ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading positions...</p>
              </div>
            ) : tokenPnl ? (
              <TokenPosition symbol={tokenData.symbol} position={tokenPnl} handleRefresh={() => {
                setIsLoadingPnl(true)
                getWalletTokenPnl(wallets[0].address, tokenAddress).then((res) => {
                  if (res.data) {
                    setTokenPnl(res.data)
                  } else {
                    setTokenPnl(null)
                  }
                }).finally(() => {
                  setIsLoadingPnl(false)
                })
              }} />
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No positions found for {tokenData.symbol}.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'Transactions' && (
          <div className="text-white">
            <h3 className="text-lg font-semibold mb-3">Transaction History</h3>
            {isLoadingTransactions ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Loading transactions...</p>
              </div>
            ) : (
              <TransactionList transactions={transactions} />
            )}
          </div>
        )}
      </div>

      {/* Fixed Trade Button */}
      <div className="fixed bottom-16 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent pb-4 px-4">
        <Button
          onClick={() => {
            if (ready && !authenticated) {
              login();
            } else {
              setIsTradeDrawerOpen(true);
            }
          }}
          className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-lg rounded-full shadow-lg transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Trade
        </Button>
      </div>

      {/* Trade Drawer */}
      <TradeDrawer
        isOpen={isTradeDrawerOpen}
        onClose={() => setIsTradeDrawerOpen(false)}
        tokenSymbol={tokenData.symbol}
        tokenAddress={tokenData.address}
      />
    </div>
  )
}