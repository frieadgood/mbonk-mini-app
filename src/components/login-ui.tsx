"use client"

import { Button } from "@/components/ui/button"
import { usePrivy } from "@privy-io/react-auth"
import { Wallet, LogIn } from "lucide-react"

export default function LoginUI() {
  const { login } = usePrivy()

  return (
    <div className="container mx-auto px-4 py-4 pb-20 flex items-center justify-center min-h-[60vh]">
      <div className="relative p-8 rounded-lg bg-gradient-to-br from-gray-900/80 via-gray-800/50 to-gray-900/80 border border-gray-800/50 backdrop-blur-sm max-w-md w-full text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to Meme Coin</h1>
          <p className="text-gray-400">Sign in to access your digital assets and manage your portfolio</p>
        </div>
        
        <div className="space-y-4">
          <Button 
            onClick={login}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-0 h-12 text-lg font-semibold"
          >
            <LogIn className="h-5 w-5 mr-2" />
            Sign In
          </Button>
          
          <div className="text-sm text-gray-500">
            Secure • Fast • Easy to use
          </div>
        </div>
      </div>
    </div>
  )
} 