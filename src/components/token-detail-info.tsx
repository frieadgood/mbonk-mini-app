"use client"

import React, { useState } from "react"
import { Copy, Check, Globe, MessageCircle, Send } from "lucide-react"
import Image from "next/image"
import { TokenOverview } from "@/types/token"

interface TokenDetailInfoProps {
  tokenData: TokenOverview
}

export function TokenDetailInfo({ tokenData }: TokenDetailInfoProps) {
  const [copied, setCopied] = useState(false)

  const copyTokenAddress = async () => {
    try {
      await navigator.clipboard.writeText(tokenData.address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy address:', err)
    }
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'website':
        return <Globe className="h-4 w-4" />
      case 'twitter':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )
      case 'telegram':
        return <Send className="h-4 w-4" />
      case 'discord':
        return <MessageCircle className="h-4 w-4" />
      case 'medium':
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M13.54 12a6.8 6.8 0 01-6.77 6.82A6.8 6.8 0 010 12a6.8 6.8 0 016.77-6.82A6.8 6.8 0 0113.54 12zM20.96 12c0 3.54-1.51 6.42-3.38 6.42-1.87 0-3.39-2.88-3.39-6.42s1.52-6.42 3.39-6.42 3.38 2.88 3.38 6.42M24 12c0 3.17-.53 5.75-1.19 5.75-.66 0-1.19-2.58-1.19-5.75s.53-5.75 1.19-5.75C23.47 6.25 24 8.83 24 12z"/>
          </svg>
        )
      default:
        return <Globe className="h-4 w-4" />
    }
  }

  const socialLinks = [
    {
      name: "Website",
      url: tokenData.extensions?.website,
      platform: "website"
    },
    {
      name: "Twitter",
      url: tokenData.extensions?.twitter,
      platform: "twitter"
    },
    {
      name: "Telegram", 
      url: tokenData.extensions?.telegram || undefined,
      platform: "telegram"
    },
    {
      name: "Discord",
      url: tokenData.extensions?.discord,
      platform: "discord"
    },
    {
      name: "Medium",
      url: tokenData.extensions?.medium,
      platform: "medium"
    }
  ].filter(link => link.url && link.url.trim() !== "")

  return (
    <div className="bg-gray-900/20 border border-gray-800/30 rounded-xl p-4 backdrop-blur-sm">
      {/* Token Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-400/30 flex items-center justify-center overflow-hidden">
            {tokenData.logoURI ? (
              <>
                <Image 
                  src={tokenData.logoURI} 
                  alt={tokenData.name} 
                  width={48} 
                  height={48} 
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
                  className="hidden items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold"
                  style={{ display: 'none' }}
                >
                  {tokenData.symbol?.slice(0, 2).toUpperCase() || 'TK'}
                </div>
              </>
            ) : (
              <div className="text-blue-400 text-lg font-bold">
                {tokenData.symbol?.slice(0, 2).toUpperCase() || 'TK'}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">{tokenData.symbol}</h3>
            <div className="h-1 w-1 bg-gray-500 rounded-full"></div>
            <span className="text-gray-400 text-sm">{tokenData.name}</span>
          </div>
          
          {/* Social Links */}
          {socialLinks.length > 0 && (
            <div className="flex items-center gap-1 mt-2">
              {socialLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-7 w-7 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-400/50 transition-all duration-200 hover:bg-blue-500/10"
                >
                  {getSocialIcon(link.platform)}
                </a>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Description */}
      {tokenData.extensions?.description && (
        <div className="mb-4">
          <div 
            className="text-sm text-gray-300 leading-relaxed bg-gray-800/30 rounded-lg p-3 border border-gray-700/30 break-words [&_a]:text-blue-400 [&_a]:underline [&_a]:hover:text-blue-300 [&_a]:transition-colors"
            dangerouslySetInnerHTML={{ 
              __html: tokenData.extensions.description 
            }}
          />
        </div>
      )}

      {/* TOKEN Address */}
      <div className="bg-gray-800/30 rounded-lg p-3 border border-gray-700/30">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-gray-400 mb-1">TOKEN ADDRESS</div>
            <div className="text-sm text-white break-all">
              {tokenData.address}
            </div>
          </div>
          <button
            onClick={copyTokenAddress}
            className="ml-3 h-8 w-8 rounded-lg bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-400 hover:bg-blue-500/30 hover:border-blue-400/50 transition-all duration-200"
          >
            {copied ? (
              <Check className="h-4 w-4" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}