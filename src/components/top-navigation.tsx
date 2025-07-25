"use client"

import React, { useEffect, useState } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { User, LogOut, Wallet, TrendingUp, Home, Star, Trophy, LogIn } from "lucide-react"
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth"
import { toast } from "sonner"
import { userTelegramLogin } from "@/lib/user"
import Image from "next/image"

const menuItems = [
  { icon: Home, label: "Home", href: "/" },
  { icon: Star, label: "Watchlist", href: "/watchlist" },
  { icon: TrendingUp, label: "Trade", href: "/trade" },
  { icon: Trophy, label: "Rank", href: "/rank" },
  { icon: Wallet, label: "Wallet", href: "/wallet" },
]

export function TopNavigation() {
  const { ready, authenticated, user, login, logout } = usePrivy();
  const { createWallet } = useSolanaWallets();
  const [isLoggedOut, setIsLoggedOut] = useState(false);
  const [isCreatingWallet, setIsCreatingWallet] = useState(false);

  useEffect(() => {
    if (authenticated && user) {
      const privyId = user.id;
      const referralFrom = "";
      const projectName = process.env.NEXT_PUBLIC_PROJECT_NAME || null;
      userTelegramLogin(privyId, referralFrom, projectName)
    }
  }, [authenticated, user]);

  return (
    <div className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <Image src="/logo.png" alt="MemeCoin" width={40} height={40} />
            {/* <span className="font-bold text-lg">Mbonk Space</span> */}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {ready && !authenticated ? (
            <button
              onClick={login}
              className="rounded-full p-1.5 hover:bg-gray-800 transition-colors"
            >
              <LogIn className="h-5 w-5 text-gray-300 hover:text-white" />
            </button>
          ) : user ? (
            <Sheet>
              <SheetTrigger asChild>
                <button className="rounded-full p-0.5 hover:bg-gray-800 transition-colors">
                  <Avatar className="h-7 w-7">
                    <AvatarImage src={user.telegram?.photoUrl ?? ""} alt={user.telegram?.username ?? "User"} />
                    <AvatarFallback>
                      <User className="h-3.5 w-3.5" />
                    </AvatarFallback>
                  </Avatar>
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-72 bg-gray-950/95 backdrop-blur-xl border-l border-gray-800/50 p-0">
                {/* Header */}
                <div className="p-4 border-b border-gray-800/50">
                  <div className="mb-3">
                    <h2 className="text-base font-semibold text-white"></h2>
                  </div>

                  {/* User Info Card */}
                  <div className="p-3 rounded-lg bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-800/50">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-10 w-10 border-2 border-blue-500/30">
                        <AvatarImage src={user.telegram?.photoUrl ?? ""} alt={user.telegram?.username ?? "User"} />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                          <User className="h-5 w-5" />
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-white text-sm">{user.telegram?.username || "Anonymous"}</h3>
                        <p className="text-xs text-gray-400">Premium User</p>
                      </div>
                    </div>

                    {/* Wallet Address */}
                    {user.wallet?.address ? (
                      <div className="flex items-center justify-between p-2 rounded-lg bg-gray-800/30 border border-gray-700/50">
                        <div className="flex items-center gap-2">
                          <Wallet className="h-3 w-3 text-blue-400" />
                          <span className="text-xs text-gray-300 font-mono">
                            {user.wallet.address.slice(0, 6)}...{user.wallet.address.slice(-4)}
                          </span>
                        </div>
                        <button
                          className="text-blue-400 hover:text-blue-300 text-xs"
                          onClick={() => {
                            navigator.clipboard.writeText(user.wallet?.address ?? "");
                            toast.success("Copied wallet address to clipboard", {
                              duration: 1000,
                              position: "top-center",
                              style: {
                                backgroundColor: "#18181b",
                                color: "#f4f4f5",
                                border: "1px solid #27272a",
                                borderRadius: "0.5rem",
                              },
                            });
                          }}
                        >
                          Copy
                        </button>
                      </div>
                    ) : (
                      <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20">
                        <div className="flex items-center gap-2 mb-2">
                          <Wallet className="h-4 w-4 text-blue-400" />
                          <span className="text-sm font-medium text-blue-400">No Wallet Connected</span>
                        </div>
                        <p className="text-xs text-gray-400 mb-3">
                          Connect your wallet to start trading and managing your assets
                        </p>
                        <button
                          onClick={async () => {
                            setIsCreatingWallet(true);
                            try {
                              await createWallet();
                            } catch (error) {
                              console.error('Failed to create wallet:', error);
                              // 如果創建失敗，導航到錢包頁面作為備選方案
                              toast.error("Failed to create wallet", {
                                description: "Please try again later",
                                duration: 2000,
                                position: "top-center",
                                style: {
                                  backgroundColor: "#dc2626", // 錯誤紅色背景
                                  color: "#fef2f2", // 淺紅色文字
                                  border: "1px solid #ef4444", // 紅色邊框
                                  borderRadius: "0.5rem",
                                  boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.3)", // 紅色陰影                              },
                                }
                              });
                            } finally {
                              setIsCreatingWallet(false);
                            }
                          }}
                          disabled={isCreatingWallet}
                          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-xs font-medium py-2 px-3 rounded-lg transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                        >
                          {isCreatingWallet ? "Creating..." : "Create Wallet"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Navigation */}
                <div className="p-4">
                  <div className="space-y-1">
                    {menuItems.map((item) => (
                      <a
                        key={item.href}
                        href={item.href}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-800/30 transition-colors group"
                      >
                        <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gray-800/50 group-hover:bg-blue-500/20 transition-colors">
                          <item.icon className="h-4 w-4 text-gray-400 group-hover:text-blue-400" />
                        </div>
                        <span className="text-sm text-gray-300 group-hover:text-white">{item.label}</span>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-gray-950 to-transparent">
                  <div className="space-y-1">
                    <button
                      onClick={() => {
                        setIsLoggedOut(true);
                        logout().finally(() => {
                          setIsLoggedOut(false);
                        });
                      }}
                      disabled={isLoggedOut}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-red-500/10 transition-colors group w-full"
                    >
                      <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-red-500/20 group-hover:bg-red-500/30 transition-colors">
                        <LogOut className="h-4 w-4 text-red-400" />
                      </div>
                      <span className="text-sm text-red-400 group-hover:text-red-300">{isLoggedOut ? "Logging out..." : "Log out"}</span>
                    </button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      </div>
    </div>
  )
}