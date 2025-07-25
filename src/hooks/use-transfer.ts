import { getTokenTransferTransaction } from "@/lib/token";
import { confirmTransaction, sendTransaction } from "@/lib/transaction";
import { ConnectedSolanaWallet, useSolanaWallets } from "@privy-io/react-auth";
import { useEffect, useState } from "react";

export const useTransfer = () => {
    const { wallets } = useSolanaWallets();
    const [wallet, setWallet] = useState<ConnectedSolanaWallet | null>(null);
    // transaction loading
    const [transactionStatus, setTransactionStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [transactionProgress, setTransactionProgress] = useState(0)
    const [transactionStep, setTransactionStep] = useState(0)

    useEffect(() => {
        if (wallets.length > 0) {
            setWallet(wallets[0]);
        }
    }, [wallets])

    const handleTransfer = async (toWalletAddress: string, tokenAddress: string, amount: number) => {
        const fromWalletAddress = wallet?.address;
        if (!fromWalletAddress) {
            throw new Error('No wallet address found');
        } else {
            setTransactionStep(1);
            setTransactionProgress(25);
        }
        const tx = await getTokenTransferTransaction(fromWalletAddress, toWalletAddress, tokenAddress, amount);
        if (!tx) {
            throw new Error('Failed to get transaction');
        } else {
            setTransactionStep(2);
            setTransactionProgress(50);
        }
        const signedTx = await wallet.signTransaction(tx);
        if (signedTx.feePayer?.toBase58() != fromWalletAddress) {
            throw new Error('Failed to sign transaction');
        } else {
            setTransactionStep(3);
            setTransactionProgress(75);
        }
        const transactionBinary = signedTx.serialize();
        const signature = await sendTransaction(transactionBinary);
        if (!signature) {
            throw new Error('Failed to send transaction');
        } else {
            setTransactionStep(4);
            setTransactionProgress(100);
        }
        const confirmed = await confirmTransaction(signature);
        if (confirmed) {
            setTransactionStatus('success');
        } else {
            setTransactionStatus('error');
        }
    }

    return {
        handleTransfer,
        transactionStatus,
        transactionProgress,
        transactionStep
    }
}