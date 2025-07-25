import { parseResolution, getNextBarTime, BE_API_KEY, getCookies } from './helpers'

interface Bar {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume?: number;
}

export interface SymbolInfo {
    address: string;
    ticker: string;
    name: string;
    description: string;
    type: string;
    session: string;
    timezone: string;
    minmov: number;
    pricescale: number;
    has_intraday: boolean;
    has_no_volume: boolean;
    has_weekly_and_monthly: boolean;
    supported_resolutions: string[];
    intraday_multipliers: string[];
    volume_precision: number;
    data_status: string;
}

interface SubscriptionItem {
    resolution: string;
    lastBar: Bar;
    callback: (bar: Bar) => void;
}

interface WebSocketMessage {
    type: string;
    data: {
        unixTime: number;
        o: number;
        h: number;
        l: number;
        c: number;
        v: number;
    };
}

interface SubscribeMessage {
    type: 'SUBSCRIBE_PRICE';
    data: {
        chartType: string;
        address: string;
        currency: string;
    };
}

interface UnsubscribeMessage {
    type: 'UNSUBSCRIBE_PRICE';
}

let subscriptionItem: SubscriptionItem = {} as SubscriptionItem;

// Create WebSocket connection.
const socket = new WebSocket(
    `wss://public-api.birdeye.so/socket/solana?x-api-key=${BE_API_KEY}`,
    'echo-protocol'
);

// Connection opened
socket.addEventListener('open', () => {
    console.log('[socket] Connected');
});

// Listen for messages
socket.addEventListener('message', (msg: MessageEvent) => {
    const data: WebSocketMessage = JSON.parse(msg.data);

    if (data.type !== 'PRICE_DATA') return console.log(data);

    const currTime = data.data.unixTime * 1000;
    const lastBar = subscriptionItem.lastBar;
    const resolution = subscriptionItem.resolution;
    const nextBarTime = getNextBarTime(lastBar, resolution);

    // get supply from cookie
    const supply = getCookies('token_supply');
    const supplyNumber = parseFloat(supply || '1');

    let bar: Bar;

    if (nextBarTime && currTime >= nextBarTime) {
        bar = {
            time: nextBarTime,
            open: data.data.o * supplyNumber,
            high: data.data.h * supplyNumber,
            low: data.data.l * supplyNumber,
            close: data.data.c * supplyNumber,
            volume: data.data.v,
        };
        console.log('[socket] Generate new bar');
    } else {
        bar = {
            ...lastBar,
            high: Math.max(lastBar.high, data.data.h * supplyNumber),
            low: Math.min(lastBar.low, data.data.l * supplyNumber),
            close: data.data.c * supplyNumber,
            volume: data.data.v,
        };
        console.log('[socket] Update the latest bar by price');
    }

    // update cookies for latest price
    document.cookie = `latest_price=${bar.close / supplyNumber}; path=/;`;

    subscriptionItem.lastBar = bar;
    subscriptionItem.callback(bar);
});

export function subscribeOnStream(
    symbolInfo: SymbolInfo,
    resolution: string,
    onRealtimeCallback: (bar: Bar) => void,
    _subscriberUID: string,
    _onResetCacheNeededCallback: () => void,
    lastBar: Bar
): void {
    subscriptionItem = {
        resolution,
        lastBar,
        callback: onRealtimeCallback,
    };

    const msg: SubscribeMessage = {
        type: 'SUBSCRIBE_PRICE',
        data: {
            chartType: parseResolution(resolution),
            address: symbolInfo.address,
            currency: 'usd',
        },
    };

    socket.send(JSON.stringify(msg));
}

export function unsubscribeFromStream(): void {
    const msg: UnsubscribeMessage = {
        type: 'UNSUBSCRIBE_PRICE',
    };
    console.log('[unsubscribeFromStream]', window.location.pathname);

    if (window.location.pathname !== '/trading') {
        socket.send(JSON.stringify(msg));
    }
}