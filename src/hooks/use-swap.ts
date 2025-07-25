import { getSwapQuote, signSwapTransaction, getSwapTransaction } from "@/lib/jupiter";
import { sendTransaction, confirmTransaction } from "@/lib/transaction";
import { ConnectedSolanaWallet, useSolanaWallets } from "@privy-io/react-auth"
import { useEffect, useState } from "react"

export const useSwap = () => {

    const { wallets } = useSolanaWallets();
    const [wallet, setWallet] = useState<ConnectedSolanaWallet | null>(null);
    // transaction loading
    const [transactionStatus, setTransactionStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [transactionProgress, setTransactionProgress] = useState(0)
    const [transactionStep, setTransactionStep] = useState(0)
    const [isTransactionLoading, setIsTransactionLoading] = useState(false)

    useEffect(() => {
        if (wallets.length > 0) {
            setWallet(wallets[0]);
        }
    }, [wallets])

    const handleSwap = async (inputMint: string, outputMint: string, uiAmount: number, slippageBps: number, priorityFee: string = "0") => {
        try {
            // Initialize transaction state
            setTransactionStatus('loading');
            setTransactionProgress(0);
            setTransactionStep(0);
            setIsTransactionLoading(true);

            const quote = await getSwapQuote(inputMint, outputMint, uiAmount, slippageBps);
            
            if (quote && wallet) {
                // Step 1: Get swap transaction (25% progress)
                setTransactionStep(1);
                setTransactionProgress(25);
                const swapTransaction = await getSwapTransaction(quote, wallet, priorityFee);
                
                if (swapTransaction) {
                    // Step 2: Sign transaction (50% progress)
                    setTransactionStep(2);
                    setTransactionProgress(50);
                    const signedTransaction = await signSwapTransaction(wallet, swapTransaction);
                    
                    // Step 3: Send transaction (75% progress)
                    setTransactionStep(3);
                    setTransactionProgress(75);
                    const signature = await sendTransaction(signedTransaction);
                    
                    // Step 4: Confirm transaction (100% progress)
                    setTransactionStep(4);
                    setTransactionProgress(100);
                    const confirmed = await confirmTransaction(signature);
                    
                    if (confirmed) {
                        setTransactionStatus('success');
                    } else {
                        setTransactionStatus('error');
                    }
                } else {
                    setTransactionStatus('error');
                }
            } else {
                setTransactionStatus('error');
            }
        } catch (error) {
            console.error('Swap error:', error);
            setTransactionStatus('error');
        }
    }

    const resetTransaction = () => {
        setIsTransactionLoading(false);
        setTransactionStatus('loading');
        setTransactionProgress(0);
        setTransactionStep(0);
    }

    return {
        handleSwap,
        transactionStatus,
        transactionProgress,
        transactionStep,
        isTransactionLoading,
        resetTransaction
    }
}