"use client"

import React, { useEffect, useState } from "react"
import { Zap } from "lucide-react"
import { WalletTokenPnl } from "@/types/wallet"
import { getJupiterTokenPrice } from "@/lib/jupiter"
import { useRecoilState } from "recoil"
import { tokenPriceAtom } from "@/state/token"
import { formatMarketCap, formatPercentage } from "@/lib/utils"
import { useSwap } from "@/hooks/use-swap"
import { TransactionLoading } from "./transaction-loading"
import { NATIVE_MINT } from "@solana/spl-token"
import { getWalletTokenBalance } from "@/lib/wallet"
import { useSolanaWallets } from "@privy-io/react-auth"

interface TokenPositionProps {
  symbol: string;
  position: WalletTokenPnl;
  handleRefresh: () => void;
}

export function TokenPosition({ symbol, position, handleRefresh }: TokenPositionProps) {

  const [solUsdPrice, setSolUsdPrice] = useState<number>(0);
  const [tokenPrice,] = useRecoilState(tokenPriceAtom);
  const { wallets } = useSolanaWallets();
  // pnl
  const [unrealizedPnLPercentage, setUnrealizedPnLPercentage] = useState<number>(0);
  const [unrealizedPnL, setUnrealizedPnL] = useState<number>(0);
  const [unrealizedPnLUsd, setUnrealizedPnLUsd] = useState<number>(0);
  const [size, setSize] = useState<number>(0);

  // trade
  const { handleSwap, isTransactionLoading, transactionStatus, transactionProgress, transactionStep } = useSwap()

  useEffect(() => {
    if (position.current_position > 0) {
      const interval = setInterval(async () => {
        const solUsdPrice = await getJupiterTokenPrice();
        if (solUsdPrice) {
          setSolUsdPrice(solUsdPrice);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [position]);

  useEffect(() => {
    if (position.current_position > 0 && solUsdPrice > 0 && tokenPrice > 0) {

      // get average price
      const averagePrice = position.average_price;
      const currentPrice = tokenPrice / solUsdPrice;

      // calculate unrealized pnl
      const unrealizedPnLPercentage = ((currentPrice - averagePrice) / averagePrice) * 100;
      const unrealizedPnL = position.current_position * (currentPrice - averagePrice);
      const unrealizedPnLUsd = unrealizedPnL * solUsdPrice;
      setUnrealizedPnL(unrealizedPnL);
      setUnrealizedPnLPercentage(unrealizedPnLPercentage);
      setUnrealizedPnLUsd(unrealizedPnLUsd);

      // calculate size
      const size = position.current_position;
      setSize(size);

    }
  }, [position, solUsdPrice, tokenPrice])

  // Show loading UI if no position
  if (size === 0 || solUsdPrice === 0 || tokenPrice === 0) {
    return (
      <div className="bg-gray-900/20 border border-gray-800/30 rounded-xl p-3 backdrop-blur-sm">
        <div className="mb-3">
          <h3 className="text-base font-semibold text-white">Your Position</h3>
        </div>

        <div className="space-y-3">
          {/* Size Loading */}
          <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30">
            <div className="flex items-center justify-between mb-1">
              <div className="text-xs text-gray-400">SIZE</div>
              <div className="h-3 w-8 bg-gray-600 rounded animate-pulse"></div>
            </div>
            <div className="h-6 w-20 bg-gray-600 rounded animate-pulse"></div>
          </div>

          {/* Loading Grid */}
          <div className="grid grid-cols-2 gap-2.5">
            {/* Return Loading */}
            <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30">
              <div className="text-xs text-gray-400 mb-1">RETURN</div>
              <div className="h-5 w-16 bg-gray-600 rounded animate-pulse"></div>
            </div>

            {/* P&L Loading */}
            <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30">
              <div className="text-xs text-gray-400 mb-1">P&L</div>
              <div className="space-y-0.5">
                <div className="h-4 w-20 bg-gray-600 rounded animate-pulse"></div>
                <div className="h-3 w-16 bg-gray-600 rounded animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gray-900/20 border border-gray-800/30 rounded-xl p-3 backdrop-blur-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-white">Your Position</h3>
      </div>

      <div className="space-y-3">
        {/* Size */}
        <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs text-gray-400">SIZE</div>
            <div className="text-xs text-gray-400">{symbol.toUpperCase()}</div>
          </div>
          <div className="text-lg font-bold text-white font-mono">
            {size.toFixed(4)}
          </div>
        </div>

        {/* Unrealized Return Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Unrealized Return % */}
          <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30">
            <div className="text-xs text-gray-400 mb-1">RETURN</div>
            <div className={`text-base font-bold font-mono ${unrealizedPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {formatPercentage(unrealizedPnLPercentage)}
            </div>
          </div>

          {/* Unrealized Return SOL & USD */}
          <div className="bg-gray-800/30 rounded-lg p-2.5 border border-gray-700/30">
            <div className="text-xs text-gray-400 mb-1">P&L</div>
            <div className="space-y-0.5">
              <div className={`text-sm font-bold font-mono ${unrealizedPnLPercentage >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                {unrealizedPnL >= 0 ? '+' : ''}{unrealizedPnL.toFixed(4)} SOL
              </div>
              <div className={`text-xs font-medium ${unrealizedPnLPercentage >= 0 ? 'text-green-400/80' : 'text-red-400/80'}`}>
                {unrealizedPnLUsd >= 0 ? '+' : ''}{formatMarketCap(unrealizedPnLUsd)}
              </div>
            </div>
          </div>
        </div>

        {/* Instant Sell Button */}
        <div className="flex justify-end mt-3">
          <button
            className="relative flex items-center gap-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-400/30 border border-cyan-400/30 hover:border-cyan-300/50 text-cyan-300 hover:text-cyan-200 px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 backdrop-blur-sm group"
            onClick={async () => {
              const tokenBalance = await getWalletTokenBalance(wallets[0].address, position.token_address);
              if (tokenBalance.data && tokenBalance.data.balance > 0) {
                await handleSwap(position.token_address, NATIVE_MINT.toBase58(), tokenBalance.data.uiAmount, 500, "0.001")
              }
            }}
          >
            <Zap className="h-4 w-4 group-hover:animate-pulse" />
            <span className="relative">
              Instant Sell
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/20 to-transparent opacity-0 group-hover:opacity-100 blur-sm transition-opacity duration-300"></div>
            </span>
          </button>
        </div>
      </div>

      <TransactionLoading
        isOpen={isTransactionLoading}
        onClose={handleRefresh}
        transactionType="sell"
        tokenSymbol={symbol}
        amount={size.toLocaleString(undefined, { maximumFractionDigits: 4 })}
        status={transactionStatus}
        progress={transactionProgress}
        currentStep={transactionStep}
      />
    </div>
  )
}