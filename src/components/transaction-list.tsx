"use client"

import { WalletTransaction } from "@/types/wallet"
import { formatDistanceToNow } from "date-fns"
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

interface TransactionListProps {
  transactions: WalletTransaction[]
}

export function TransactionList({ transactions }: TransactionListProps) {

  const openTransaction = (txid: string) => {
    window.open(`https://solscan.io/tx/${txid}`, '_blank')
  }

  if (transactions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-400">No transactions found for this token.</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {transactions.map((transaction: WalletTransaction) => (
        <div
          key={transaction.txid}
          className="bg-gray-900/50 rounded-lg p-4 border border-gray-800/50 hover:border-gray-700/50 transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className={`p-1.5 rounded-full ${
                transaction.trade_type === 'buy' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-red-500/20 text-red-400'
              }`}>
                {transaction.trade_type === 'buy' ? (
                  <ArrowDownLeft className="h-3 w-3" />
                ) : (
                  <ArrowUpRight className="h-3 w-3" />
                )}
              </div>
              <div className="text-sm font-medium text-white capitalize">
                {transaction.trade_type}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(transaction.timestamp), { addSuffix: true })}
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => openTransaction(transaction.txid)}
                className="h-6 w-6 hover:bg-gray-800/50 p-0"
              >
                <ExternalLink className="h-3 w-3 text-gray-400" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <div className="text-gray-400 mb-1">Amount In</div>
              <div className="text-white font-mono">
                {transaction.input_amount.toLocaleString(undefined, {
                  maximumFractionDigits: 6
                })}
              </div>
            </div>
            <div>
              <div className="text-gray-400 mb-1">Amount Out</div>
              <div className="text-white font-mono">
                {transaction.output_amount.toLocaleString(undefined, {
                  maximumFractionDigits: 6
                })}
              </div>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-gray-800/50">
            <div className="text-xs text-gray-400">
              Transaction: {transaction.txid.slice(0, 8)}...{transaction.txid.slice(-8)}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}