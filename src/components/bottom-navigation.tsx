"use client"

import React from "react"
import { usePathname } from "next/navigation"
import { Home, Star, TrendingUp, Trophy, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

interface NavigationItem {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  href: string
}

const navigationItems: NavigationItem[] = [
  {
    id: "home",
    label: "Home",
    icon: Home,
    href: "/",
  },
  {
    id: "watchlist",
    label: "Watchlist",
    icon: Star,
    href: "/watchlist",
  },
  {
    id: "trade",
    label: "Trade",
    icon: TrendingUp,
    href: `/trade/${process.env.NEXT_PUBLIC_PROJECT_TOKEN_ADDRESS}`,
  },
  {
    id: "rank",
    label: "Rank",
    icon: Trophy,
    href: "/rank",
  },
  {
    id: "wallet",
    label: "Wallet",
    icon: Wallet,
    href: "/wallet",
  },
]

export function BottomNavigation() {
  const pathname = usePathname()

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-t border-gray-800/50">
      <nav className="flex items-center justify-around px-4 py-2.5">
        {navigationItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "relative flex items-center justify-center p-2.5 rounded-lg transition-all duration-200",
                isActive
                  ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-400"
                  : "text-gray-400 hover:text-gray-300 hover:bg-gray-800/30"
              )}
            >
              <item.icon
                className={cn(
                  "h-5 w-5 transition-all duration-200",
                  isActive ? "text-blue-400" : "text-gray-400"
                )}
              />
              {isActive && (
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}