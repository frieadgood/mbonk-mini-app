"use client"

import { Button } from "@/components/ui/button"
import { formatMarketCap, truncateAddress } from "@/lib/utils"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import {
  Wallet,
  Send,
  ShoppingCart,
  Download,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react"
import { useEffect, useState } from "react"
import LoginUI from "@/components/login-ui"
import CreateWalletUI from "@/components/create-wallet-ui"
import LoadingUI from "@/components/loading-ui"
import { getWalletBalance } from "@/lib/wallet"
import { WalletBalance, WalletTokenItem } from "@/types/wallet"
import Image from "next/image"
import { toast } from "sonner"
import SendTokenDrawer from "@/components/send-token-drawer"
import { useRouter } from "next/navigation"

export default function WalletPage() {
  const router = useRouter();
  const { ready, authenticated } = usePrivy();
  const { wallets, exportWallet } = useSolanaWallets();
  // wallet balance data
  const [walletBalance, setWalletBalance] = useState<WalletBalance>({
    wallet: "",
    totalUsd: 0,
    items: []
  });

  const [showBalance, setShowBalance] = useState(true)

  const fetchWalletBalance = async (walletAddress: string) => {
    const walletBalanceQuery = await getWalletBalance(walletAddress);
    if (!walletBalanceQuery.error) {
      setWalletBalance(walletBalanceQuery.data);
    }
  }

  useEffect(() => {
    if (ready && authenticated && wallets && wallets.length > 0) {
      fetchWalletBalance(wallets[0].address);
    }
  }, [ready, authenticated, wallets]);

  const copyAddress = () => {
    navigator.clipboard.writeText(walletBalance.wallet)
  }

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

  // Authenticated and has wallet - show main wallet UI
  return (
    <div className="container mx-auto px-4 py-4 pb-20 space-y-4">
      {/* Wallet Header */}
      <div className="relative p-4 rounded-lg bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80 border border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-400" />
              <h1 className="text-lg font-bold text-white">My Wallet</h1>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-sm text-gray-400 font-mono">{truncateAddress(walletBalance.wallet)}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0 hover:bg-gray-800/50 text-gray-400 hover:text-white"
              >
                <Copy className="h-3 w-3" />
              </Button>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="hover:bg-gray-800/50 text-gray-400 hover:text-white"
          >
            {showBalance ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>

        <div className="text-center mb-6">
          <div className="text-2xl font-bold mb-2 text-white">
            {showBalance ? formatMarketCap(walletBalance.totalUsd) : "****"}
          </div>
          <div className="text-sm text-gray-400">Total Portfolio Value</div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <SendTokenDrawer
            tokens={walletBalance.items}
            trigger={
              <Button
                variant="outline"
                className="flex flex-col items-center gap-2 h-auto py-3 bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
              >
                <Send className="h-4 w-4" />
                <span className="text-xs">Send</span>
              </Button>
            }
            onRefreshBalance={() => {
              fetchWalletBalance(wallets[0].address)
            }}
          />
          <Button
            onClick={() => {
              toast.info('Coming soon', {
                position: 'top-center',
                duration: 1500
              })
            }}
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-3 bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
          >
            <ShoppingCart className="h-4 w-4" />
            <span className="text-xs">Buy</span>
          </Button>
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-3 bg-gray-800/50 border-gray-700/50 text-gray-300 hover:bg-gray-700/50 hover:text-white"
            onClick={() => {
              exportWallet({ address: wallets[0].address })
            }}
          >
            <Download className="h-4 w-4" />
            <span className="text-xs">Export</span>
          </Button>
        </div>
      </div>

      {/* Token Balances */}
      <div className="relative p-4 rounded-lg bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80 border border-gray-800/50 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white">Portfolio</h2>
        </div>
        <div className="space-y-2">
          {walletBalance.items.map((token: WalletTokenItem) => (
            <div
              key={token.address}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/30 transition-colors cursor-pointer"
              onClick={() => {
                if (token.address !== 'So11111111111111111111111111111111111111111') {
                  router.push(`/trade/${token.address}`)
                }
              }}
            >
              <div className="flex items-center gap-2">
                <div className="text-xl relative">
                  <Image
                    src={token.logoURI}
                    alt={token.symbol}
                    width={24}
                    height={24}
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const fallback = target.nextElementSibling as HTMLElement;
                      if (fallback) {
                        fallback.style.display = 'flex';
                      }
                    }}
                    className="rounded-full"
                  />
                  <div
                    className="hidden items-center justify-center w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-xs font-bold"
                    style={{ display: 'none' }}
                  >
                    {token.symbol?.slice(0, 2).toUpperCase() || 'TK'}
                  </div>
                </div>
                <div>
                  <div className="font-medium text-white text-sm">{token.name}</div>
                  <div className="text-xs text-gray-400">
                    {showBalance ? token.uiAmount.toLocaleString() : "****"} {token.symbol}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-medium text-white text-sm">
                  {showBalance ? formatMarketCap(token.valueUsd) : "****"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}