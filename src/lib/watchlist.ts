import axios from "axios";

const MIMIR_API_URL = process.env.NEXT_PUBLIC_MIMIR_API_URL;

export const getWatchList = async (walletAddress: string) => {
    const data = await axios({
        url: `${MIMIR_API_URL}/telegram/watchlist/get`,
        method: 'GET',
        params: {
            wallet_address: walletAddress
        }
    }).then((response) => {
        const result = response.data.Result;
        return {
            data: result,
            error: null
        };
    }).catch((error) => {
        console.error('Error fetching watchlist data', error);
        return {
            data: [],
            error: error
        };
    });
    return data;
}

export const addToWatchlist = async (walletAddress: string, tokenAddress: string) => {
    const status = await axios({
        url: `${MIMIR_API_URL}/telegram/watchlist/add`,
        method: 'POST',
        data: {
            wallet_address: walletAddress,
            token_address: tokenAddress
        }
    }).then(() => {
        return true;
    }).catch((error) => {
        console.error('Error adding watchlist data', error);
        return false;
    });
    return status;
}

export const removeFromWatchlist = async (walletAddress: string, tokenAddress: string) => {
    const status = await axios({
        url: `${MIMIR_API_URL}/telegram/watchlist/remove`,
        method: 'POST',
        data: {
            wallet_address: walletAddress,
            token_address: tokenAddress
        }
    }).then(() => {
        return true;
    }).catch((error) => {
        console.error('Error removing watchlist data', error);
        return false;
    });
    return status;
}