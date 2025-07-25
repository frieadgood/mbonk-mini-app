"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Medal, Award, User, Crown, TrendingUp, TrendingDown, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { usePrivy } from "@privy-io/react-auth"
import LoadingUI from "@/components/loading-ui"
import { Rank } from "@/types/rank"
import { getRankList } from "@/lib/rank"

export default function RankPage() {

  const { ready, user } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState("win");
  const [rankList, setRankList] = useState<Rank[]>([]);

  useEffect(() => {
    getRankList(selectedTab).then((data) => {
      if (data.data) {
        setRankList(data.data)
      }
    }).finally(() => {
      setIsLoading(false);
    });
  }, [selectedTab]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return (
      <div className="relative p-2 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500">
        <Crown className="h-3 w-3 text-white" />
      </div>
    )
    if (rank === 2) return (
      <div className="relative p-2 rounded-full bg-gradient-to-br from-gray-300 to-gray-500">
        <Medal className="h-3 w-3 text-white" />
      </div>
    )
    if (rank === 3) return (
      <div className="relative p-2 rounded-full bg-gradient-to-br from-amber-500 to-orange-600">
        <Award className="h-3 w-3 text-white" />
      </div>
    )
    return (
      <div className="w-6 h-6 rounded-full bg-gray-800/50 flex items-center justify-center">
        <span className="text-gray-400 font-medium text-xs">#{rank}</span>
      </div>
    )
  }

  const getRankColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border-yellow-500/30"
    if (rank === 2) return "bg-gradient-to-r from-gray-400/10 to-gray-500/10 border-gray-400/30"
    if (rank === 3) return "bg-gradient-to-r from-amber-500/10 to-orange-600/10 border-amber-500/30"
    return "bg-gradient-to-r from-gray-900/50 to-gray-800/30 border-gray-800/50"
  }

  if (!ready || isLoading) {
    return <LoadingUI />
  }

  return (
    <div className="container mx-auto px-4 py-4 pb-20 space-y-4">

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 border border-gray-700/50 h-10">
          <TabsTrigger value="win" className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400 data-[state=active]:border-green-500/30 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Wins
            </div>
          </TabsTrigger>
          <TabsTrigger value="lose" className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400 data-[state=active]:border-red-500/30 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <TrendingDown className="h-3 w-3" />
              Loss
            </div>
          </TabsTrigger>
          <TabsTrigger value="volume" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-400 data-[state=active]:border-purple-500/30 text-gray-400 text-sm">
            <div className="flex items-center gap-1">
              <BarChart3 className="h-3 w-3" />
              Volume
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="win" className="space-y-2 mt-3">
          {rankList.map((rank: Rank, index: number) => (
            <div
              key={`win-${index}`}
              className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 hover:border-gray-700/50 ${rank.user_id === user?.id ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30" : getRankColor(index+1)
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <Avatar className="h-8 w-8 border border-gray-700/50">
                  <AvatarImage src={rank.photoUrl} alt={rank.firstName} />
                  <AvatarFallback className="bg-gray-800 text-gray-400">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white text-sm">{rank.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-green-400 text-sm">{rank.trading_pnl.toFixed(2)} SOL</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="lose" className="space-y-2 mt-3">
          {rankList.map((rank: Rank, index: number) => (
            <div
              key={`lose-${index}`}
              className={`flex items-center justify-between p-3 rounded border ${rank.user_id === user?.id ? "bg-purple-500/10 border-purple-500/30" : getRankColor(index+1)
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <Avatar className="h-8 w-8 border border-gray-700/50">
                  <AvatarImage src={rank.photoUrl} alt={rank.firstName} />
                  <AvatarFallback className="bg-gray-800 text-gray-400">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white text-sm">{rank.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-red-400 text-sm">{rank.trading_pnl.toFixed(2)} SOL</div>
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="volume" className="space-y-2 mt-3">
          {rankList.map((rank: Rank, index: number) => (
            <div
              key={`volume-${index}`}
              className={`flex items-center justify-between p-3 rounded border ${rank.user_id === user?.id ? "bg-green-500/10 border-green-500/30" : getRankColor(index+1)
                }`}
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8">
                  {getRankIcon(index + 1)}
                </div>
                <Avatar className="h-8 w-8 border border-gray-700/50">
                  <AvatarImage src={rank.photoUrl} alt={rank.firstName} />
                  <AvatarFallback className="bg-gray-800 text-gray-400">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium text-white text-sm">{rank.username}</div>
                </div>
              </div>

              <div className="text-right">
                <div className="font-semibold text-purple-400 text-sm">{rank.trading_volume.toFixed(2)} SOL</div>
              </div>
            </div>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}