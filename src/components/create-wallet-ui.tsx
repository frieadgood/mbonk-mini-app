"use client"

import { Button } from "@/components/ui/button"
import { useSolanaWallets } from "@privy-io/react-auth"
import { Shield, Sparkles } from "lucide-react"
import { useState } from "react"

export default function CreateWalletUI() {
  const { createWallet } = useSolanaWallets()
  const [isCreatingWallet, setIsCreatingWallet] = useState(false)

  const handleCreateWallet = async () => {
    setIsCreatingWallet(true)
    try {
      await createWallet()
    } catch (error) {
      console.error('Failed to create wallet:', error)
    } finally {
      setIsCreatingWallet(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-20 flex items-center justify-center min-h-[60vh]">
      <div className="relative p-8 rounded-lg bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80 border border-gray-800/50 backdrop-blur-sm max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Create Your Wallet</h1>
          <p className="text-gray-400">Set up your secure Solana wallet to start managing your digital assets</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={handleCreateWallet}
            disabled={isCreatingWallet}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-12 text-lg font-semibold disabled:opacity-50"
          >
            {isCreatingWallet ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Wallet...
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Create Wallet
              </>
            )}
          </Button>
          
          <div className="text-sm text-gray-500 space-y-1">
            <div>✓ Secure key generation</div>
            <div>✓ Instant setup</div>
            <div>✓ Ready to use immediately</div>
          </div>
        </div>
      </div>
    </div>
  )
} 