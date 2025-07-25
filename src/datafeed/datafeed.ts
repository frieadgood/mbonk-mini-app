import { getTokenOverview } from '@/lib/token'
import {
    getCookies,
    makeApiRequest,
    parseResolution,
} from './helpers'
import { subscribeOnStream, SymbolInfo, unsubscribeFromStream } from './streaming'
import {
    LibrarySymbolInfo,
    Bar,
    PeriodParams,
    DatafeedConfiguration,
    ResolveCallback,
    ErrorCallback,
    HistoryCallback,
    SubscribeBarsCallback,
    ResolutionString,
    SearchSymbolResultItem
} from '../../public/charting_library/datafeed-api'

const lastBarsCache = new Map<string, Bar>();

const configurationData: DatafeedConfiguration = {
    supported_resolutions: ['1', '3', '5', '15', '30', '60', '120', '240', '1D', '1W'] as ResolutionString[],
    exchanges: [],
};

const datafeed = {
    onReady: (callback: (configuration: DatafeedConfiguration) => void): void => {
        console.log('[onReady]: Method call');
        setTimeout(() => callback(configurationData));
    },

    searchSymbols: (
        _userInput: string,
        _exchange: string,
        _symbolType: string,
        onResult: (symbols: SearchSymbolResultItem[]) => void
    ): void => {
        // Implementation can be added here if needed
        onResult([]);
    },

    resolveSymbol: async (
        symbolAddress: string,
        onSymbolResolvedCallback: ResolveCallback,
        onResolveErrorCallback: ErrorCallback,
        extension?: unknown
    ): Promise<void> => {
        console.log('[resolveSymbol]: Extension', extension);
        console.log('[resolveSymbol]: Method call', symbolAddress);
        const symbolQuery = await getTokenOverview(symbolAddress);
        console.log('[resolveSymbol]: Symbol query', symbolQuery);
        const symbolItem = symbolQuery.data;

        if (!symbolItem) {
            console.log('[resolveSymbol]: Cannot resolve symbol', symbolAddress);
            onResolveErrorCallback('cannot resolve symbol');
            return;
        }

        const symbolInfo: LibrarySymbolInfo & { address: string } = {
            address: symbolItem.address,
            ticker: symbolItem.address,
            name: symbolItem.symbol,
            full_name: symbolItem.symbol + '/USD',
            listed_exchange: '',
            exchange: '',
            format: 'price',
            description: symbolItem.symbol + '/USD',
            type: symbolItem.type,
            session: '24x7',
            timezone: 'Etc/UTC',
            minmov: 1,
            pricescale: 10 ** 16,
            has_intraday: true,
            has_weekly_and_monthly: false,
            supported_resolutions: configurationData.supported_resolutions,
            volume_precision: 2,
            data_status: 'streaming',
        };

        console.log('[resolveSymbol]: Symbol resolved', symbolAddress);
        onSymbolResolvedCallback(symbolInfo);
    },

    getBars: async (
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        periodParams: PeriodParams,
        onHistoryCallback: HistoryCallback,
        onErrorCallback: ErrorCallback
    ): Promise<void> => {
        const { from, to, firstDataRequest } = periodParams;
        console.log('[getBars]: Method call', symbolInfo, resolution, from, to);
        
        const urlParameters: Record<string, string | number> = {
            address: (symbolInfo as LibrarySymbolInfo & { address: string }).address || symbolInfo.ticker || '',
            type: parseResolution(resolution),
            time_from: from,
            time_to: to,
        };
        
        const query = Object.keys(urlParameters)
            .map((name) => `${name}=${encodeURIComponent(urlParameters[name])}`)
            .join('&');

        // get supply from cookie
        const supply = getCookies('token_supply');
        const supplyNumber = parseFloat(supply || '1');

        try {
            const data = await makeApiRequest(`defi/ohlcv?${query}`);
            if (!data.success || (data.data as { items: unknown[] }).items.length === 0) {
                // "noData" should be set if there is no data in the requested period.
                onHistoryCallback([], {
                    noData: true,
                });
                return;
            }
            
            let bars: Bar[] = [];
            (data.data as { items: { unixTime: number, l: number, h: number, o: number, c: number }[] }).items.forEach((bar) => {
                if (bar.unixTime >= from && bar.unixTime < to) {
                    bars = [
                        ...bars,
                        {
                            time: bar.unixTime * 1000,
                            low: bar.l * supplyNumber,
                            high: bar.h * supplyNumber,
                            open: bar.o * supplyNumber,
                            close: bar.c * supplyNumber,
                        },
                    ];
                }
            });
            
            if (firstDataRequest && bars.length > 0) {
                const address = (symbolInfo as LibrarySymbolInfo & { address: string }).address || symbolInfo.ticker || '';
                lastBarsCache.set(address, {
                    ...bars[bars.length - 1],
                });
                document.cookie = `latest_price=${bars[bars.length - 1].close / supplyNumber}; path=/;`;
            }
            
            console.log(`[getBars]: returned ${bars.length} bar(s)`);
            onHistoryCallback(bars, {
                noData: false,
            });
        } catch (error) {
            console.log('[getBars]: Get error', error);
            onErrorCallback(error as string);
        }
    },

    subscribeBars: (
        symbolInfo: LibrarySymbolInfo,
        resolution: ResolutionString,
        onRealtimeCallback: SubscribeBarsCallback,
        subscriberUID: string,
        onResetCacheNeededCallback: () => void
    ): void => {
        console.log(
            '[subscribeBars]: Method call with subscriberUID:',
            subscriberUID
        );
        
        const address = (symbolInfo as LibrarySymbolInfo & { address: string }).address || symbolInfo.ticker || '';
        const lastBar = lastBarsCache.get(address);
        if (lastBar) {
            subscribeOnStream(
                symbolInfo as unknown as SymbolInfo,
                resolution,
                onRealtimeCallback,
                subscriberUID,
                onResetCacheNeededCallback,
                lastBar
            );
        }
    },

    unsubscribeBars: (): void => {
        console.log('[unsubscribeBars]');
        unsubscribeFromStream();
    },
};

export default datafeed;