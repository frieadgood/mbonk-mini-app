export interface SwapInfo {
    ammKey: string;
    label: string;
    inputMint: string;
    outputMint: string;
    inAmount: string;
    outAmount: string;
    feeAmount: string;
    feeMint: string;
}

export interface RoutePlan {
    swapInfo: SwapInfo;
    percent: number;
}

export interface QuoteResponse {
    inputMint: string;
    inAmount: string;
    outputMint: string;
    outAmount: string;
    otherAmountThreshold: string;
    swapMode: string;
    slippageBps: number;
    platformFee: null | unknown;
    priceImpactPct: string;
    routePlan: RoutePlan[];
    contextSlot: number;
    timeTaken: number;
}

export interface swapInput {
    quoteResponse: QuoteResponse;
    userPublicKey: string;
    dynamicComputeUnitLimit: boolean;
    prioritizationFeeLamports: number;
    wrapAndUnwrapSol: boolean;
    feeAccount?: string | null;
}
