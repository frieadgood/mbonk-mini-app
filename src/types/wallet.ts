export interface WalletTokenItem {
    address: string;
    decimals: number;
    balance: number;
    uiAmount: number;
    chainId: string;
    name: string;
    symbol: string;
    logoURI: string;
    priceUsd: number;
    valueUsd: number;
}

export interface WalletBalance {
    wallet: string;
    totalUsd: number;
    items: WalletTokenItem[];
}

export interface WalletTransaction {
    wallet_address: string;
    timestamp: string;
    txid: string;
    trade_type: "buy" | "sell";
    input_token_address: string;
    output_token_address: string;
    input_amount: number;
    output_amount: number;
}

export interface ActivePosition {
    quantity: number;
    price: number;
    txid: string;
    timestamp: string;
}

export interface RealizedPnlRecord {
    txid: string;
    quantity: number;
    buyPrice: number;
    sellPrice: number;
    realizedPnL: number;
    cost: number;
    timestamp: string;
}

export interface WalletTokenPnl {
    token_address: string;
    wallet_address: string;
    active_position: ActivePosition[];
    average_price: number;
    current_position: number;
    last_update: string;
    realized_pnl_records: RealizedPnlRecord[];
    total_realized_pnl: number;
    total_realized_pnl_percentage: number;
    buy_count: number;
    sell_count: number;
    win_count: number;
} 