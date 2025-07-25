"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Settings, ChevronDown, ChevronUp, Loader2 } from "lucide-react"
import { getWalletSolBalance, getWalletTokenBalance } from "@/lib/wallet"
import { useSolanaWallets } from "@privy-io/react-auth"
import { NATIVE_MINT } from "@solana/spl-token"
import { TransactionLoading } from "@/components/transaction-loading"
import { useSwap } from "@/hooks/use-swap"

interface TradeDrawerProps {
  isOpen: boolean
  onClose: () => void
  tokenSymbol?: string
  tokenAddress?: string
}

export function TradeDrawer({ isOpen, onClose, tokenSymbol = "SOL", tokenAddress = NATIVE_MINT.toBase58() }: TradeDrawerProps) {

  const { wallets } = useSolanaWallets();
  const [activeTab, setActiveTab] = useState<'buy' | 'sell'>('buy')
  const [amount, setAmount] = useState("")
  const [selectedPercentage, setSelectedPercentage] = useState<number | null>(null)
  const [slippage, setSlippage] = useState("5.0")
  const [priorityFee, setPriorityFee] = useState("0.005")
  const [showAdvanced, setShowAdvanced] = useState(false)

  // balance
  const [balanceLoading, setBalanceLoading] = useState(false)
  const [balanceAmount, setBalanceAmount] = useState<number>(0)
  
  // swap hooks
  const { 
    handleSwap, 
    transactionStatus, 
    transactionProgress, 
    transactionStep, 
    isTransactionLoading, 
    resetTransaction 
  } = useSwap();
  
  // Determine currency based on buy/sell
  const currentCurrency = activeTab === 'buy' ? 'SOL' : tokenSymbol

  useEffect(() => {
    const fetchBalance = async () => {
      const walletAddress = wallets[0].address;
      if (activeTab === 'buy') {
        const balance = await getWalletSolBalance(walletAddress)
        setBalanceAmount(balance)
      } else {
        const balanceQuery = await getWalletTokenBalance(walletAddress, tokenAddress);
        if (balanceQuery.error) {
          setBalanceAmount(0)
        } else {
          setBalanceAmount(balanceQuery.data.uiAmount)
        }
      }
    }
    if (isOpen && wallets.length > 0) {
      setBalanceLoading(true)
      fetchBalance().finally(() => {
        setBalanceLoading(false)
      })
    }
  }, [isOpen, activeTab, wallets, tokenAddress])

  const percentages = [25, 50, 75, 100]

  const handlePercentageClick = (percentage: number) => {
    setSelectedPercentage(percentage)
    // Calculate amount based on current currency balance
    setAmount((percentage / 100 * balanceAmount).toString())
  }

  // Reset percentage when manually editing amount
  const handleAmountChange = (value: string) => {
    setAmount(value)
    setSelectedPercentage(null)
  }

  // Preset slippage options
  const slippagePresets = ["0.1", "0.5", "1.0", "5.0"]
  // Preset priority fee options  
  const priorityFeePresets = ["0.001", "0.005", "0.01"]

  const handleTrade = async () => {
    if (!amount || parseFloat(amount) === 0) return
    
    onClose()

    const uiAmount = parseFloat(amount);
    const slippageBps = parseFloat(slippage) * 100;
    const inputMint = activeTab === 'buy' ? NATIVE_MINT.toBase58() : tokenAddress;
    const outputMint = activeTab === 'buy' ? tokenAddress : NATIVE_MINT.toBase58();

    await handleSwap(inputMint, outputMint, uiAmount, slippageBps, priorityFee);
    
    // Handle success after transaction completes
    if (transactionStatus === 'success') {
      handleTransactionSuccess();
    }
  }

  const handleTransactionSuccess = () => {
    setSelectedPercentage(null)
  }


  const handleTransactionClose = () => {
    resetTransaction();
    setAmount("")
    setSelectedPercentage(null)
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="bg-gray-900 border-gray-800 rounded-t-2xl max-h-[95vh] overflow-y-auto pb-4 px-4"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-left">
            Trade {tokenSymbol}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-4">
          {/* Buy/Sell Tab List */}
          <div className="flex bg-gray-800/50 rounded-lg p-0.5">
            <button
              onClick={() => setActiveTab('buy')}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium text-sm transition-all ${
                activeTab === 'buy'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setActiveTab('sell')}
              className={`flex-1 py-1.5 px-3 rounded-md font-medium text-sm transition-all ${
                activeTab === 'sell'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Amount Input with Quick Select */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-300">
                Amount ({currentCurrency})
              </label>
              <span className="text-xs text-gray-400 flex items-center gap-1">Bal: {balanceLoading ? <Loader2 className="animate-spin text-gray-400 w-4 h-4" /> : balanceAmount.toLocaleString()} {currentCurrency}</span>
            </div>
            <div className="relative">
              <input
                type="number"
                value={amount}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="0.00"
                className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                style={{ fontSize: '16px' }}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <span className="text-gray-400 text-sm font-medium">{currentCurrency}</span>
              </div>
            </div>
            {/* Quick Select Buttons integrated below input */}
            <div className="grid grid-cols-4 gap-2">
              {percentages.map((percentage) => (
                <button
                  key={percentage}
                  onClick={() => handlePercentageClick(percentage)}
                  className={`py-1.5 px-3 rounded text-xs font-medium transition-all ${
                    selectedPercentage === percentage
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  {percentage}%
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Settings Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="w-full flex items-center justify-between p-3 bg-gray-800/20 hover:bg-gray-800/40 rounded-lg transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              <span className="text-sm font-medium text-gray-400 group-hover:text-white transition-colors">
                Advanced Settings
              </span>
            </div>
            <div className="flex items-center gap-2">
              {showAdvanced ? (
                <ChevronUp className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-400 group-hover:text-white transition-colors" />
              )}
            </div>
          </button>

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 bg-gray-800/30 rounded-lg p-4 border-l-2 border-blue-500/30">
              {/* Slippage */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Slippage Tolerance
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {slippagePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setSlippage(preset)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        slippage === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset}%
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={slippage}
                    onChange={(e) => setSlippage(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: '16px' }}
                    step="0.1"
                    min="0.1"
                    max="50"
                    placeholder="Custom"
                  />
                  <span className="text-gray-400 text-sm">%</span>
                </div>
              </div>

              {/* Priority Fee */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-gray-300">
                    Priority Fee
                  </label>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  {priorityFeePresets.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setPriorityFee(preset)}
                      className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                        priorityFee === preset
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={priorityFee}
                    onChange={(e) => setPriorityFee(e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    style={{ fontSize: '16px' }}
                    step="0.001"
                    min="0.001"
                    placeholder="Custom"
                  />
                  <span className="text-gray-400 text-sm">SOL</span>
                </div>
              </div>
            </div>
          )}

          {/* Trade Summary */}
          <div className="bg-gray-800/30 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">You pay</span>
              <span className="text-white">{amount || "0"} {currentCurrency}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Slippage</span>
              <span className="text-white">{slippage}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Priority Fee</span>
              <span className="text-white">{priorityFee} SOL</span>
            </div>
          </div>

          {/* Trade Button */}
          <Button
            onClick={handleTrade}
            className={`w-full py-4 text-base font-semibold rounded-lg transition-all ${
              activeTab === 'buy'
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-red-600 hover:bg-red-700 text-white'
            }`}
            disabled={!amount || parseFloat(amount) === 0}
          >
            {activeTab === 'buy' ? 'Buy' : 'Sell'} {tokenSymbol}
          </Button>
        </div>
      </SheetContent>
      
      {/* Transaction Loading Animation */}
      <TransactionLoading
        isOpen={isTransactionLoading}
        onClose={handleTransactionClose}
        transactionType={activeTab}
        tokenSymbol={tokenSymbol}
        amount={amount}
        status={transactionStatus}
        progress={transactionProgress}
        currentStep={transactionStep}
      />
    </Sheet>
  )
}