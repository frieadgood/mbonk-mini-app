"use client"

import { CheckCircle, AlertCircle, Loader2 } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface TransactionLoadingProps {
  isOpen: boolean
  onClose: () => void
  transactionType: 'buy' | 'sell' | 'transfer'
  tokenSymbol: string
  amount: string
  status?: 'loading' | 'success' | 'error'
  progress?: number
  currentStep?: number
}

export function TransactionLoading({ 
  isOpen, 
  onClose, 
  transactionType, 
  tokenSymbol, 
  amount,
  status = 'loading',
  progress = 0,
  currentStep = 0
}: TransactionLoadingProps) {


  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent 
        side="bottom" 
        className="bg-gray-900 border-gray-800 rounded-t-2xl max-h-[90vh] overflow-y-auto pb-4"
      >
        <SheetHeader className="pb-4">
          <SheetTitle className="text-white text-center">
            {status === 'loading' && `${transactionType === 'buy' ? 'Buying' : transactionType === 'sell' ? 'Selling' : 'Sending'} ${tokenSymbol}`}
            {status === 'success' && 'Transaction Successful!'}
            {status === 'error' && 'Transaction Failed'}
          </SheetTitle>
        </SheetHeader>

        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="mb-4">
              {status === 'loading' && (
                <div className="relative mx-auto w-16 h-16">
                  <div className="absolute inset-0 rounded-full border-4 border-gray-700"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                  <div className="absolute inset-2 rounded-full border-2 border-purple-500 border-b-transparent animate-spin" style={{animationDirection: 'reverse', animationDuration: '0.8s'}}></div>
                </div>
              )}
              {status === 'success' && (
                <div className="mx-auto w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
              )}
              {status === 'error' && (
                <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              )}
            </div>
            
            <p className="text-gray-400 text-sm">
              {status === 'loading' && `${transactionType === 'buy' ? 'Purchasing' : transactionType === 'sell' ? 'Selling' : 'Sending'} ${amount} ${tokenSymbol}`}
              {status === 'success' && `Successfully ${transactionType === 'buy' ? 'purchased' : transactionType === 'sell' ? 'sold' : 'sent'} ${amount} ${tokenSymbol}`}
              {status === 'error' && 'Please try again or check your wallet'}
            </p>
          </div>

        {/* Progress Bar */}
        {status === 'loading' && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>Progress</span>
              <span>{progress.toFixed(0)}%</span>
            </div>
            <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Current Step */}
        {status === 'loading' && (
          <div className="mb-6">
            <div className="flex items-center gap-3 text-sm">
              <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />
              <span className="text-white">
                {currentStep === 0 && "Preparing transaction..."}
                {currentStep === 1 && "Signing with wallet..."}
                {currentStep === 2 && "Submitting to network..."}
                {currentStep === 3 && "Confirming transaction..."}
              </span>
            </div>
          </div>
        )}

        {/* Transaction Details */}
        <div className="bg-gray-800/50 rounded-lg p-4 mb-6 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Type</span>
            <span className={`font-medium capitalize ${transactionType === 'buy' ? 'text-green-400' : transactionType === 'sell' ? 'text-red-400' : 'text-blue-400'}`}>
              {transactionType}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Token</span>
            <span className="text-white font-medium">{tokenSymbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Amount</span>
            <span className="text-white font-medium">{amount}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Status</span>
            <span className={`font-medium capitalize ${
              status === 'loading' ? 'text-blue-400' : 
              status === 'success' ? 'text-green-400' : 'text-red-400'
            }`}>
              {status === 'loading' ? 'Processing' : status}
            </span>
          </div>
        </div>

        {/* Actions */}
        {status !== 'loading' && (
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="w-full py-3 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              {status === 'success' ? 'Close' : 'Confirm'}
            </button>
          </div>
        )}

        </div>
      </SheetContent>
    </Sheet>
  )
}