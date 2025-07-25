"use client"

import React, { useEffect, useRef, useState } from "react"
import { Shield } from "lucide-react"
import { TokenSecurity } from "@/types/token"
import { getTokenSecurity } from "@/lib/token"

interface TradeSecurityProps {
  tokenAddress: string
}

interface SecurityCheckItemProps {
  label: string
  status: 'safe' | 'warning' | 'danger'
  description: string
  value?: string | number
}

function SecurityCheckItem({ label, status, description, value }: SecurityCheckItemProps) {

  const getStatusColor = () => {
    switch (status) {
      case 'safe':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'danger':
        return 'text-red-400'
    }
  }

  return (
    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/30 border border-gray-800/50">
      <div className="flex items-center gap-3 w-[70%]">
        <div>
          <div className="text-sm font-medium text-white">{label}</div>
          <div className="text-xs text-gray-400">{description}</div>
        </div>
      </div>
      {value && (
        <div className={`text-sm font-semibold ${getStatusColor()}`}>
          {value}
        </div>
      )}
    </div>
  )
}

export function TradeSecurity({ tokenAddress }: TradeSecurityProps) {
  // Use provided data or mock data
  const fetchSecurityDataRef = useRef<boolean>(false)
  const [securityData, setSecurityData] = useState<TokenSecurity>({
    mintAuthBurned: false,
    freezable: false,
    permanentDelegate: false,
    top10HoldersPercent: 0
  })

  useEffect(() => {
    if (fetchSecurityDataRef.current) return;
    fetchSecurityDataRef.current = true;

    const fetchSecurityData = async () => {
      const data = await getTokenSecurity(tokenAddress)
      setSecurityData({
        mintAuthBurned: data.mintAuthBurned,
        freezable: data.freezable,
        permanentDelegate: data.permanentDelegate,
        top10HoldersPercent: parseFloat(data.top10HoldersPercent)
      })
    }
    if (tokenAddress && tokenAddress !== "") {
      fetchSecurityData()
    }
  }, [tokenAddress])
  
  // Determine security check statuses
  const getTop10HolderStatus = (percentage: number): 'safe' | 'warning' | 'danger' => {
    if (percentage <= 15) return 'safe'
    if (percentage <= 25) return 'warning'
    return 'danger'
  }

  const getAuthorityStatus = (authority: boolean): 'safe' | 'danger' => {
    return authority ? 'safe' : 'danger'
  }

  const top10Status = getTop10HolderStatus(securityData.top10HoldersPercent)
  const mintStatus = getAuthorityStatus(securityData.mintAuthBurned)
  const freezeStatus = getAuthorityStatus(!securityData.freezable)
  const delegateStatus = getAuthorityStatus(!securityData.permanentDelegate)

  // Calculate overall security score
  const securityChecks = [
    top10Status === 'safe' ? 1 : 0,
    mintStatus === 'safe' ? 1 : 0,
    freezeStatus === 'safe' ? 1 : 0,
    delegateStatus === 'safe' ? 1 : 0,
  ]
  const securityScore = securityChecks.reduce((sum, check) => sum + check, 0)
  const totalChecks = securityChecks.length

  const getOverallStatus = (): 'safe' | 'warning' | 'danger' => {
    const ratio = securityScore / totalChecks
    if (ratio >= 0.75) return 'safe'
    if (ratio >= 0.5) return 'warning'
    return 'danger'
  }

  const overallStatus = getOverallStatus()
  const getOverallColor = () => {
    switch (overallStatus) {
      case 'safe':
        return 'text-green-400'
      case 'warning':
        return 'text-yellow-400'
      case 'danger':
        return 'text-red-400'
    }
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-blue-400" />
          <h3 className="text-base font-semibold text-white">Security Checks</h3>
        </div>
        <div className="text-right">
          <div className={`text-sm font-semibold ${getOverallColor()}`}>
            {securityScore}/{totalChecks} Passed
          </div>
          <div className="text-xs text-gray-400">Security Score</div>
        </div>
      </div>

      {/* Security Checks */}
      <div className="space-y-2">
        <SecurityCheckItem
          label="Top 10 Holders"
          status={top10Status}
          description={`${securityData.top10HoldersPercent}% held by top 10 wallets`}
          value={top10Status === 'safe' ? "✓ Passed" : "⚠ Failed"}
        />
        
        <SecurityCheckItem
          label="Mint Authority"
          status={mintStatus}
          description="Whether new tokens can be minted, potentially diluting supply"
          value={mintStatus === 'safe' ? "✓ Passed" : "⚠ Failed"}
        />
        
        <SecurityCheckItem
          label="Freezable"
          status={freezeStatus}
          description="Whether token accounts can be frozen by developer"
          value={freezeStatus === 'safe' ? "✓ Passed" : "⚠ Failed"}
        />
        
        <SecurityCheckItem
          label="Permanent Delegate"
          status={delegateStatus}
          description="Whether there's a permanent authority that can transfer tokens"
          value={delegateStatus === 'safe' ? "✓ Passed" : "⚠ Failed"}
        />
      </div>
    </div>
  )
}