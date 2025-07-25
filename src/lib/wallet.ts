import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import axios from "axios";

const BIRDEYE_API_URL = process.env.NEXT_PUBLIC_BIRDEYE_API_URL;
const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;
const MIMIR_API_URL = process.env.NEXT_PUBLIC_MIMIR_API_URL;

export const getWalletBalance = async (walletAddress: string) => {

    const tokenInfo = await axios({
        url: `${BIRDEYE_API_URL}/v1/wallet/token_list`,
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': BIRDEYE_API_KEY
        },
        params: {
            wallet: walletAddress
        }
    }).then((response) => {
        const result = response.data.data;
        return {
            data: result,
            error: null
        };
    }).catch((error) => {
        console.error('Error fetching wallet balance', error);
        return {
            data: null,
            error: error.response.data
        };
    });
    return tokenInfo;
}

export const getWalletTokenBalance = async (walletAddress: string, tokenAddress: string) => {

    const tokenBalance = await axios({
        url: `${BIRDEYE_API_URL}/v1/wallet/token_balance`,
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': BIRDEYE_API_KEY
        },
        params: {
            wallet: walletAddress,
            token_address: tokenAddress
        }
    }).then((response) => {
        const result = response.data.data;
        return {
            data: result,
            error: null
        };
    }).catch((error) => {
        console.error('Error fetching wallet token balance', error);
        return {
            data: null,
            error: error.response.data
        };
    });

    return tokenBalance;
}

export const getWalletSolBalance = async (walletAddress: string) => {
    try {
        const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string);
        const balance = await connection.getBalance(new PublicKey(walletAddress));
        return balance / LAMPORTS_PER_SOL;
    } catch (error) {
        console.error('Error getting SOL balance', error);
        return 0;
    }
}

export const getWalletTransactions = async (walletAddress: string, tokenAddress: string) => {

    const transactionsInfo = await axios({
        url: `${MIMIR_API_URL}/telegram/wallet/transactions`,
        method: 'GET',
        headers: {
            accept: 'application/json'
        },
        params: {
            wallet_address: walletAddress,
            token_address: tokenAddress
        }
    }).then((response) => {
        const result = response.data.Result;
        return {
            data: result,
            error: null
        };
    }).catch((error) => {
        console.error('Error fetching wallet transactions', error);
        return {
            data: null,
            error: error.response.data
        };
    });

    return transactionsInfo;
}

export const getWalletTokenPnl = async (walletAddress: string, tokenAddress: string) => {

    const tokenBalance = await getWalletTokenBalance(walletAddress, tokenAddress);
    
    if (tokenBalance.error) {
        return {
            data: null,
            error: tokenBalance.error
        };
    }
    
    if (tokenBalance.data == null || tokenBalance.data?.balance == 0) {
        return {
            data: null,
            error: null
        };
    }

    const pnlInfo = await axios({
        url: `${MIMIR_API_URL}/telegram/wallet/pnl`,
        method: 'GET',
        headers: {
            accept: 'application/json'
        },
        params: {
            wallet_address: walletAddress,
            token_address: tokenAddress
        }
    }).then((response) => {
        const result = response.data.Result;
        if (result.length === 0) {
            return {
                data: null,
                error: null
            };
        }
        return {
            data: result[0],
            error: null
        };
    }).catch((error) => {
        console.error('Error fetching wallet pnl', error);
        return {
            data: null,
            error: error.response.data
        };
    });

    return pnlInfo;
}