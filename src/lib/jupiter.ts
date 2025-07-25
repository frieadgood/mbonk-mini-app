import { NATIVE_MINT } from "@solana/spl-token";
import axios from "axios";
import { getTokenMint } from "./token";
import { QuoteResponse, swapInput } from "@/types/jupiter";
import { LAMPORTS_PER_SOL, PublicKey, VersionedTransaction } from "@solana/web3.js";
import { ConnectedSolanaWallet } from "@privy-io/react-auth";
import { toast } from "sonner";

const JUPITER_API_URL = 'https://lite-api.jup.ag';

export const getJupiterTokenPrice = async (tokenAddress: string = NATIVE_MINT.toBase58()) => {

    const tokenPrice = await axios({
        url: `${JUPITER_API_URL}/price/v3`,
        method: 'GET',
        params: {
            ids: tokenAddress
        }
    }).then((response) => {
        const data = response.data;
        if (data[tokenAddress]) {
            return data[tokenAddress].usdPrice;
        } else {
            return null;
        }
    }).catch((error) => {
        console.log('Error fetching jupiter token price', error);
        return null;
    });

    return tokenPrice;
}

export const getSwapQuote = async (
    inputMint: string,
    outputMint: string,
    uiAmount: number,
    slippageBps: number
): Promise<QuoteResponse | null> => {

    // convert ui amount to big number amount
    let inputAmount;
    if (inputMint == NATIVE_MINT.toBase58()) {
        inputAmount = Math.floor(uiAmount * (10 ** 9));
    } else {
        const { mintInfo } = await getTokenMint(inputMint);
        inputAmount = Math.floor(uiAmount * (10 ** mintInfo.decimals));
    }

    const quote = await axios({
        url: `${JUPITER_API_URL}/swap/v1/quote`,
        method: 'GET',
        params: {
            inputMint: inputMint,
            outputMint: outputMint,
            amount: inputAmount,
            slippageBps: slippageBps,
            onlyDirectRoutes: true,
            platformFeeBps: 100 // 1%
        }
    }).then((response) => {
        return response.data;
    }).catch((error) => {
        console.log('Error fetching jupiter swap quote', error);
        return null;
    });

    return quote;
}

export const getFeeAccount = async () => {

    const projectWalletAddress = process.env.NEXT_PUBLIC_PROJECT_FEE_WALLET_ADDRESS || null;
    if (!projectWalletAddress) {
        return null;
    }

    // referral account
    const referralAccountPubkey = new PublicKey(projectWalletAddress);

    // fee account
    const [feeAccount] = PublicKey.findProgramAddressSync(
        [
            Buffer.from("referral_ata"),
            referralAccountPubkey.toBuffer(),
            NATIVE_MINT.toBuffer(),
        ],
        new PublicKey("REFER4ZgmyYx9c6He5XfaTMiGfdLwRnkV4RPp9t9iF3")
    )

    return feeAccount.toBase58();
}

export const getSwapTransaction = async (
    quote: QuoteResponse,
    wallet: ConnectedSolanaWallet,
    priorityFee: string = "0"
) => {

    const priorityFeeLamports = Math.floor(parseFloat(priorityFee) * LAMPORTS_PER_SOL);
    const feeAccount = await getFeeAccount();
    const walletAddress = wallet.address;

    const swapData: swapInput = {
        quoteResponse: quote,
        userPublicKey: walletAddress,
        dynamicComputeUnitLimit: true,
        prioritizationFeeLamports: priorityFeeLamports,
        wrapAndUnwrapSol: true
    }
    if (feeAccount) {
        swapData.feeAccount = feeAccount;
    }

    const swapResponse = await axios({
        method: 'POST',
        url: `${JUPITER_API_URL}/swap/v1/swap`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: swapData
    }).then((res) => {
        return res.data;
    }).catch((err) => {
        console.log('Error fetching jupiter swap transaction', err);
        return null;
    });

    const swapTransaction = swapResponse.swapTransaction;

    if (!swapTransaction) {
        toast.error('Failed to get transaction', {
            description: 'Please try again!',
            duration: 2000,
            position: 'top-center',
            style: {
                backgroundColor: "#dc2626",
                color: "#fef2f2",
                border: "1px solid #ef4444",
            }
        });
        return null;
    }

    return swapTransaction;
}

export const signSwapTransaction = async (wallet: ConnectedSolanaWallet, swapTransaction: string): Promise<Uint8Array> => {
    const transaction = VersionedTransaction.deserialize(Buffer.from(swapTransaction, 'base64'));
    const signedTransaction = await wallet.signTransaction(transaction);
    const transactionBinary = signedTransaction.serialize();
    return transactionBinary;
}