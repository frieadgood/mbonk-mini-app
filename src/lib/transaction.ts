import { Connection } from "@solana/web3.js";

const connection = new Connection(process.env.NEXT_PUBLIC_SOLANA_RPC_URL as string);

export const sendTransaction = async (transactionBinary: Uint8Array): Promise<string> => {
    const signature = await connection.sendRawTransaction(transactionBinary, {
        maxRetries: 2,
        skipPreflight: true
    });
    return signature;
}

export const confirmTransaction = async (signature: string): Promise<boolean> => {
    const lastValidBlockHeight = await connection.getLatestBlockhash();

    const confirmation = await connection.confirmTransaction({
        signature: signature,
        lastValidBlockHeight: lastValidBlockHeight.lastValidBlockHeight,
        blockhash: lastValidBlockHeight.blockhash
    }, "confirmed");

    if (confirmation.value.err) {
        console.log('Transaction failed', confirmation.value.err);
        return false;
    } else {
        console.log('Transaction successful', `https://solscan.io/tx/${signature}/`);
        return true;
    }
}