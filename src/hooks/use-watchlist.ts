import { getTokenOverview } from "@/lib/token";
import { addToWatchlist, getWatchList, removeFromWatchlist } from "@/lib/watchlist";
import { TokenOverview } from "@/types/token";
import { usePrivy, useSolanaWallets } from "@privy-io/react-auth";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export const useWatchlist = () => {
    const { ready, authenticated } = usePrivy();
    const { wallets } = useSolanaWallets();
    const fetchWatchlistRef = useRef<boolean>(false);
    const [watchlist, setWatchlist] = useState<TokenOverview[]>([]);

    const fetchWatchlist = useCallback(async () => {
        const result = await getWatchList(wallets[0].address);
        if (!result.error) {
            const watchlist = await Promise.all(result.data.map(async (tokenAddress: string) => {
                const tokenInfo = await getTokenOverview(tokenAddress);
                return tokenInfo.data;
            }));
            setWatchlist(watchlist);
        }
    }, [wallets]);

    const handleAddToWatchlist = async (tokenAddress: string) => {
        const status = await addToWatchlist(wallets[0].address, tokenAddress);
        if (status) {
            const newTokenOverview = await getTokenOverview(tokenAddress);
            setWatchlist([newTokenOverview.data, ...watchlist]);
            toast.success('Token added to watchlist', {
                position: 'top-center',
                duration: 1500,
            });
        } else {
            toast.error('Failed to add token to watchlist', {
                position: 'top-center',
                duration: 1500,
                style: {
                    backgroundColor: "#dc2626", // 錯誤紅色背景
                    color: "#fef2f2", // 淺紅色文字
                    border: "1px solid #ef4444", // 紅色邊框
                    borderRadius: "0.5rem",
                    boxShadow: "0 4px 6px -1px rgba(220, 38, 38, 0.3)", // 紅色陰影                              },
                }
            });
        }
    }

    const handleRemoveFromWatchlist = async (tokenAddress: string) => {
        const status = await removeFromWatchlist(wallets[0].address, tokenAddress);
        if (status) {
            setWatchlist(watchlist.filter((token) => token.address !== tokenAddress));
            toast.success('Token removed from watchlist', {
                position: 'top-center',
                duration: 1500,
            });
        } else {
            toast.error('Failed to remove token from watchlist', {
                position: 'top-center',
                duration: 1500,
                style: {
                    backgroundColor: "#dc2626",
                    color: "#fef2f2",
                    border: "1px solid #ef4444",
                }
            });
        }
    }

    useEffect(() => {
        if (ready && authenticated && wallets && wallets.length > 0 && !fetchWatchlistRef.current) {
            fetchWatchlistRef.current = true;
            fetchWatchlist();
        }
    }, [ready, authenticated, wallets, fetchWatchlist]);

    return { watchlist, handleAddToWatchlist, handleRemoveFromWatchlist };
}