import { ComputeBudgetProgram, Connection, PublicKey, Transaction } from "@solana/web3.js";
import { NATIVE_MINT, TOKEN_2022_PROGRAM_ID, TOKEN_PROGRAM_ID, getMint, getPermanentDelegate } from "@solana/spl-token";
import axios from "axios";

const BIRDEYE_API_URL = process.env.NEXT_PUBLIC_BIRDEYE_API_URL;
const BIRDEYE_API_KEY = process.env.NEXT_PUBLIC_BIRDEYE_API_KEY;
const SHYFT_API_KEY = process.env.NEXT_PUBLIC_SHYFT_API_KEY;
const SHYFT_API_URL = process.env.NEXT_PUBLIC_SHYFT_API_URL;

export const getTokenOverview = async (tokenAddress: string) => {
    const tokenInfo = await axios({
        url: `${BIRDEYE_API_URL}/defi/token_overview`,
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': BIRDEYE_API_KEY
        },
        params: {
            address: tokenAddress
        }
    }).then((response) => {
        const result = response.data.data;
        return {
            data: result,
            error: null
        };
    }).catch((error) => {
        console.log('Error fetching token info', error);
        return {
            data: null,
            error: error.response.data
        };
    });

    return tokenInfo;
}

export const getTrendingTokens = async (page: number, limit: number) => {

    const offset = (page - 1) * limit;

    const tokens = await axios({
        url: `${BIRDEYE_API_URL}/defi/token_trending`,
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-chain': 'solana',
            'X-API-KEY': BIRDEYE_API_KEY
        },
        params: {
            sort_by: 'rank',
            sort_type: 'asc',
            offset: offset,
            limit: limit
        }
    }).then((response) => {
        const result = response.data.data;
        return result.tokens;
    }).catch((error) => {
        console.log('Error fetching trend data', error);
        return [];
    });

    return tokens;
}

export const searchTokens = async (params: {
    chain: string,
    keyword: string,
    target: string,
    search_mode: 'exact' | 'fuzzy',
    search_by: 'name' | 'symbol' | 'address' | 'combination',
    sort_by: string,
    sort_type: string,
    verify_token: boolean | null,
    offset: number,
    limit: number
}) => {
    const tokenInfo = await axios({
        url: `${BIRDEYE_API_URL}/defi/v3/search`,
        method: 'GET',
        headers: {
            accept: 'application/json',
            'x-chain': params.chain,
            'X-API-KEY': BIRDEYE_API_KEY
        },
        params: params
    }).then((response) => {
        const result = response.data.data;
        return {
            data: result.items,
            error: null
        };
    }).catch(() => {
        console.log('Error fetching search token info');
        return {
            data: [],
            error: null
        };
    });

    return tokenInfo;
}

export const getTokenTop10Holders = async (tokenAddress: string, mintInfo: unknown) => {

    const mint = new PublicKey(tokenAddress);

    const accounts = await axios({
        method: 'get',
        url: `${BIRDEYE_API_URL}/defi/v3/token/holder`,
        headers: {
            'X-API-KEY': BIRDEYE_API_KEY,
            'x-chain': 'solana',
            'Content-Type': 'application/json'
        },
        params: {
            address: mint.toBase58(),
            offset: 0,
            limit: 50
        }
    }).then((res) => {
        return res.data.data.items;
    }).catch((err) => {
        console.log(err);
        return [];
    });

    const poolsInfo = await axios({
        method: 'get',
        url: 'https://defi.shyft.to/v0/pools/get_by_token',
        headers: {
            'x-api-key': SHYFT_API_KEY,
            'Content-Type': 'application/json'
        },
        params: {
            page: 1,
            limit: 50,
            token: mint.toBase58()
        }
    }).then((res) => {
        return res.data.result.dexes;
    }).catch((err) => {
        console.log(err);
        return {}
    });

    const poolsBaseVault = Object.values(poolsInfo)
        .flatMap((pool: unknown) => (pool as { pools: unknown[] }).pools)
        .flatMap((pool: unknown) => [(pool as { baseVault: string }).baseVault, (pool as { quoteVault: string }).quoteVault]);

    const top10Accounts = accounts.filter((account: unknown) => !poolsBaseVault.includes((account as { token_account: string }).token_account)).slice(0, 10);
    const totalSupply = Number((mintInfo as { supply: string }).supply);
    const top10Supply = top10Accounts.reduce((acc: number, account: unknown) => acc + Number((account as { amount: string }).amount), 0);
    const top10Percentage = (top10Supply / totalSupply) * 100;

    return top10Percentage.toFixed(2);

}

export const getTokenMint = async (tokenAddress: string) => {
    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string);
    let mintInfo = null;
    let programId = TOKEN_PROGRAM_ID;
    try {
        mintInfo = await getMint(connection, new PublicKey(tokenAddress), "confirmed", programId);
    } catch {
        programId = TOKEN_2022_PROGRAM_ID;
        mintInfo = await getMint(connection, new PublicKey(tokenAddress), "confirmed", programId);
    }
    return {
        mintInfo: mintInfo,
        programId: programId
    };
}

export const getTokenSecurity = async (tokenAddress: string) => {

    const { mintInfo } = await getTokenMint(tokenAddress);
    const permanentDelegate = await getPermanentDelegate(mintInfo);
    const top10HoldersPercent = await getTokenTop10Holders(tokenAddress, mintInfo);

    return {
        mintAuthBurned: mintInfo.mintAuthority === null ? true : false,
        freezable: mintInfo.freezeAuthority === null ? false : true,
        permanentDelegate: permanentDelegate === null ? false : true,
        top10HoldersPercent: top10HoldersPercent
    }

}

const getTokenTransferEncodedTransaction = async (fromWalletAddress: string, toWalletAddress: string, tokenAddress: string, amount: number) => {
    let encoded_transaction = null;
    if (tokenAddress == 'So11111111111111111111111111111111111111111') {
        encoded_transaction = await axios({
            url: `${SHYFT_API_URL}/wallet/send_sol`,
            method: 'POST',
            headers: {
                'x-api-key': SHYFT_API_KEY,
                'Content-Type': 'application/json'
            },
            data: {
                network: 'mainnet-beta',
                from_address: fromWalletAddress,
                to_address: toWalletAddress,
                amount: amount
            }
        }).then((res) => {
            return res.data.result.encoded_transaction;
        }).catch((err) => {
            console.error('Error fetching sol transfer transaction', err);
            return null;
        });
    } else {
        encoded_transaction = await axios({
            url: `${SHYFT_API_URL}/token/transfer_detach`,
            method: 'POST',
            headers: {
                'x-api-key': SHYFT_API_KEY,
                'Content-Type': 'application/json'
            },
            data: {
                network: 'mainnet-beta',
                from_address: fromWalletAddress,
                to_address: toWalletAddress,
                token_address: tokenAddress,
                amount: amount
            }
        }).then((res) => {
            return res.data.result.encoded_transaction;
        }).catch((err) => {
            console.log('Error fetching token transfer transaction', err);
            return null;
        });
    }
    return encoded_transaction;
}

export const getTokenTransferTransaction = async (fromWalletAddress: string, toWalletAddress: string, tokenAddress: string, amount: number) => {

    const encoded_transaction = await getTokenTransferEncodedTransaction(fromWalletAddress, toWalletAddress, tokenAddress, amount);

    if (!encoded_transaction) {
        return null;
    }

    const tx = new Transaction();

    if (tokenAddress == NATIVE_MINT.toBase58()) {
        tx.add(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: 1_000
            })
        );
        tx.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 10000000
            })
        );
    } else {
        tx.add(
            ComputeBudgetProgram.setComputeUnitLimit({
                units: 50_000
            })
        );

        tx.add(
            ComputeBudgetProgram.setComputeUnitPrice({
                microLamports: 1500000
            })
        );
    }


    const recoveredTransaction = Transaction.from(
        Buffer.from(encoded_transaction, 'base64')
    );
    for (const ix of (recoveredTransaction as Transaction).instructions) {
        if (ix.programId.toBase58() != 'ComputeBudget111111111111111111111111111111') {
            tx.add(ix);
        };
    }

    const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string);
    const latestBlockhash = await connection.getLatestBlockhash();

    tx.recentBlockhash = latestBlockhash.blockhash;
    tx.feePayer = new PublicKey(fromWalletAddress);

    return tx;
}