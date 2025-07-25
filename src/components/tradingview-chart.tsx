'use client';

import { useEffect, useState } from "react";
import { ResolutionString, CustomFormatters, Timezone } from "../../public/charting_library/charting_library";
import { formatPrice } from "@/datafeed/helpers";
import Datafeed from '@/datafeed/datafeed';
import { useRecoilState } from "recoil";
import { selectedTimeframeAtom } from "@/state/tradingview-chart";
import { Loader2 } from "lucide-react";

const chartingLibraryPath = '/charting_library/';

export default function TradingViewChart({ symbol }: { symbol: string }) {

    const [isLoading, setIsLoading] = useState(true);
    const [selectedTimeframe] = useRecoilState(selectedTimeframeAtom);
    const chartType = 1;

    useEffect(() => {

        if (typeof window !== 'undefined' && window.TradingView && symbol) {
            setIsLoading(true);
            console.log('Charting library is available');

            const customFormatters = {
                priceFormatterFactory: (symbolInfo: unknown, minTick: unknown) => {
                    console.log('priceFormatterFactory', symbolInfo, minTick);
                    return {
                        format: (price: number) => {
                            return formatPrice(price);
                        },
                    };
                },
            }

            const overrides: object = {
                "mainSeriesProperties.style": chartType,
                "paneProperties.vertGridProperties.color": "rgba(0, 0, 0, 1)",
                "paneProperties.horzGridProperties.color": "rgba(0, 0, 0, 1)",
                "paneProperties.backgroundType": "solid",
                "paneProperties.background": "rgba(0, 0, 0, 1)",
                "paneProperties.legendProperties.showSeriesOHLC": true,
                "paneProperties.legendProperties.showStudyTitles": false,
                "paneProperties.legendProperties.showStudyValues": false,
                "paneProperties.legendProperties.showStudyArguments": false,
                "paneProperties.legendProperties.showSeriesTitle": false,
                "paneProperties.legendProperties.showBarChange": false,
                "paneProperties.legendProperties.showBackground": false,
                "paneProperties.topMargin": 20,
                "paneProperties.bottomMargin": 10,
                "scalesProperties.lineColor": "rgba(0, 0, 0, 1)",
                // "scalesProperties.textColor": "rgba(0, 0, 0, 1)",
            };

            const widget = new window.TradingView.widget({
                container: 'tv_chart_container',
                locale: 'en',
                library_path: chartingLibraryPath,
                datafeed: Datafeed,
                symbol: symbol,
                interval: selectedTimeframe as ResolutionString,
                theme: 'dark',
                autosize: true,
                custom_formatters: customFormatters as CustomFormatters,
                disabled_features: [
                    "adaptive_logo",
                    "accessibility",
                    "header_widget",
                    "left_toolbar",
                    "border_around_the_chart",
                    "control_bar",
                    "go_to_date",
                    "property_pages",
                    "timeframes_toolbar",
                    "timezone_menu",
                    "context_menus",
                    "main_series_scale_menu",
                    "chart_property_page_right_margin_editor",
                    "display_market_status"
                ],
                enabled_features: [
                    "hide_object_tree_and_price_scale_exchange_label"
                ],
                timezone: (Intl.DateTimeFormat().resolvedOptions().timeZone as Timezone),
            }); 

            widget.onChartReady(() => {
                console.log('Chart is ready');
                widget.applyOverrides(overrides);

                const chart = widget.activeChart();
                chart.setVisibleRange(
                    {
                        from: chart.getVisibleRange().from,
                        to: chart.getVisibleRange().to
                    },
                    {
                        percentRightMargin: 10
                    }
                );

                setIsLoading(false)
            });
        }
    }, [symbol, selectedTimeframe]);

    return (
        <>
            {isLoading && (
                <div className="h-[320px] flex items-center justify-center bg-black">
                    <Loader2 className="h-12 w-12 text-gray-600 animate-spin" />
                </div>
            )}
            <div
                id="tv_chart_container"
                className={`h-[320px] w-full ${!isLoading ? 'fade-in' : 'hidden'}`}
            />
        </>
    );
}