"use client"

import { useEffect, useState } from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger
} from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import {
  Search,
  ArrowLeft,
  Send as SendIcon,
  ChevronRight
} from "lucide-react"
import { WalletTokenItem } from "@/types/wallet"
import Image from "next/image"
import { formatMarketCap } from "@/lib/utils"
import { useTransfer } from "@/hooks/use-transfer"
import { TransactionLoading } from "./transaction-loading"
import { toast } from "sonner"

interface SendTokenDrawerProps {
  tokens: WalletTokenItem[]
  trigger: React.ReactNode
  onRefreshBalance: () => void
}

type Step = 'token-selection' | 'send-details'

export default function SendTokenDrawer({ tokens, trigger, onRefreshBalance }: SendTokenDrawerProps) {
  // transaction loading
  const { handleTransfer, transactionStatus, transactionProgress, transactionStep } = useTransfer();
  const [isTransactionLoading, setIsTransactionLoading] = useState(false);
  // drawer
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState<Step>('token-selection')
  const [selectedToken, setSelectedToken] = useState<WalletTokenItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  // CbMAXitEa23My9CnCaeUGTPhR9gDTeQSiHWKCnp8qjBh
  const [recipientAddress, setRecipientAddress] = useState('')
  const [amount, setAmount] = useState('')

  const filteredTokens = tokens.filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleTokenSelect = (token: WalletTokenItem) => {
    setSelectedToken(token)
    setCurrentStep('send-details')
  }

  const handleBack = () => {
    if (currentStep === 'send-details') {
      setCurrentStep('token-selection')
    }
  }

  const handleSend = () => {
    setIsTransactionLoading(true);
    handleTransfer(recipientAddress, selectedToken?.address || '', parseFloat(amount)).then(() => {
      onRefreshBalance()
    }).catch((error) => {
      toast.error(error.message, {
        position: 'top-center',
        duration: 1500,
        style: {
          backgroundColor: "#dc2626", // 錯誤紅色背景
          color: "#fef2f2", // 淺紅色文字
          border: "1px solid #ef4444", // 紅色邊框
          borderRadius: "0.5rem",
          boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.3)", // 紅色陰影
        }
      });
    });
  }

  const handleClose = () => {
    setIsOpen(false)
    // Reset state when closing
    setCurrentStep('token-selection')
    setSelectedToken(null)
    setRecipientAddress('')
    setAmount('')
    setSearchQuery('')
  }

  const isValidSend = selectedToken && recipientAddress && amount && parseFloat(amount) > 0

  useEffect(() => {
    if (currentStep == 'token-selection') {
      setAmount('')
    }
  }, [currentStep])

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild onClick={() => setIsOpen(true)}>
        {trigger}
      </SheetTrigger>
      <SheetContent
        side="bottom"
        className="h-[85vh] bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 border-gray-800/50 backdrop-blur-sm"
        onPointerDownOutside={handleClose}
        onEscapeKeyDown={handleClose}
      >
        <SheetHeader className="pb-6">
          <div className="flex items-center gap-3">
            {currentStep === 'send-details' && (
              <Button
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="h-8 w-8 text-gray-400 hover:text-white hover:bg-gray-800/50"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <SheetTitle className="text-white text-lg font-semibold">
              {currentStep === 'token-selection' ? 'Select Token' : 'Send Token'}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden">
          {currentStep === 'token-selection' && (
            <TokenSelectionStep
              tokens={filteredTokens}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              onTokenSelect={handleTokenSelect}
            />
          )}

          {currentStep === 'send-details' && selectedToken && (
            <SendDetailsStep
              selectedToken={selectedToken}
              recipientAddress={recipientAddress}
              amount={amount}
              onRecipientChange={setRecipientAddress}
              onAmountChange={setAmount}
              onSend={handleSend}
              isValidSend={isValidSend || false}
            />
          )}
        </div>
      </SheetContent>
      <TransactionLoading
        isOpen={isTransactionLoading}
        onClose={() => {
          setIsTransactionLoading(false)
          handleClose()
        }}
        transactionType="transfer"
        tokenSymbol={selectedToken?.symbol || ''}
        amount={amount}
        status={transactionStatus}
        progress={transactionProgress}
        currentStep={transactionStep}
      />
    </Sheet>
  )
}

interface TokenSelectionStepProps {
  tokens: WalletTokenItem[]
  searchQuery: string
  onSearchChange: (query: string) => void
  onTokenSelect: (token: WalletTokenItem) => void
}

function TokenSelectionStep({
  tokens,
  searchQuery,
  onSearchChange,
  onTokenSelect
}: TokenSelectionStepProps) {
  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tokens..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Token List */}
      <div className="flex-1 overflow-y-auto space-y-2 max-h-[calc(85vh-200px)]">
        {tokens.map((token) => (
          <button
            key={token.address}
            onClick={() => onTokenSelect(token)}
            className="w-full flex items-center justify-between p-4 rounded-lg bg-gray-800/30 border border-gray-700/50 hover:bg-gray-700/40 transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <Image
                  src={token.logoURI}
                  alt={token.symbol}
                  width={32}
                  height={32}
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
                  className="hidden items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold"
                  style={{ display: 'none' }}
                >
                  {token.symbol?.slice(0, 2).toUpperCase() || 'TK'}
                </div>
              </div>
              <div>
                <div className="font-medium text-white">{token.name}</div>
                <div className="text-sm text-gray-400">
                  {token.uiAmount.toLocaleString()} {token.symbol}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="font-medium text-white">
                  {formatMarketCap(token.valueUsd)}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

interface SendDetailsStepProps {
  selectedToken: WalletTokenItem
  recipientAddress: string
  amount: string
  onRecipientChange: (address: string) => void
  onAmountChange: (amount: string) => void
  onSend: () => void
  isValidSend: boolean
}

function SendDetailsStep({
  selectedToken,
  recipientAddress,
  amount,
  onRecipientChange,
  onAmountChange,
  onSend,
  isValidSend
}: SendDetailsStepProps) {

  const isSOL = selectedToken.address === 'So11111111111111111111111111111111111111111';
  const maxAmount = Math.max(0, selectedToken.uiAmount - (isSOL ? 0.002 : 0));

  return (
    <div className="space-y-6 h-full flex flex-col">
      {/* Selected Token Info */}
      <div className="p-4 rounded-lg bg-gray-800/30 border border-gray-700/50">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Image
              src={selectedToken.logoURI}
              alt={selectedToken.symbol}
              width={32}
              height={32}
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
              className="hidden items-center justify-center w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-bold"
              style={{ display: 'none' }}
            >
              {selectedToken.symbol?.slice(0, 2).toUpperCase() || 'TK'}
            </div>
          </div>
          <div className="flex-1">
            <div className="font-medium text-white">{selectedToken.name}</div>
            <div className="text-sm text-gray-400">
              Available: {selectedToken.uiAmount.toLocaleString()} {selectedToken.symbol}
            </div>
          </div>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4 flex-1">
        {/* Recipient Address */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Recipient Address
          </label>
          <input
            type="text"
            placeholder="Enter wallet address..."
            value={recipientAddress}
            onChange={(e) => onRecipientChange(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none font-mono text-sm"
          />
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount
          </label>
          <div className="relative">
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              step="any"
              min="0"
              max={maxAmount}
              className="w-full px-4 py-3 pr-20 bg-gray-800/50 border border-gray-700/50 rounded-lg text-white placeholder-gray-400 focus:outline-none"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
              {selectedToken.symbol}
            </div>
          </div>
          <button
            onClick={() => onAmountChange(maxAmount.toString())}
            className="mt-2 text-xs text-blue-400 hover:text-blue-300"
          >
            Max: {maxAmount.toLocaleString()}
          </button>
        </div>
      </div>

      {/* Send Button */}
      <div className="pt-4">
        <Button
          onClick={onSend}
          disabled={!isValidSend}
          className="w-full py-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg flex items-center justify-center gap-2"
        >
          <SendIcon className="h-4 w-4" />
          Send {selectedToken.symbol}
        </Button>
      </div>
    </div>
  )
}