export const BE_API_KEY = 'c7000a49372c41189400c7ccc57fd94a';

// Make requests to Birdeye API
interface ApiResponse {
    success: boolean;
    data: unknown;
}

export async function makeApiRequest(path: string): Promise<ApiResponse> {
    try {
        const response = await fetch(
            `https://public-api.birdeye.so/${path}`,
            {
                headers: {
                    "X-API-KEY": BE_API_KEY
                }
            }
        );
        const data = await response.json();
        return data as ApiResponse;
    } catch (error: unknown) {
        throw new Error(`Birdeye request error: ${(error as Error).message}`);
    }
}

const RESOLUTION_MAPPING: Record<string, string> = {
    "1": "1m",
    "3": "3m",
    "5": "5m",
    "15": "15m",
    "30": "30m",
    "60": "1H",
    "120": "2H",
    "240": "4H",
    "1D": "1D",
    "1W": "1W",
};

export function parseResolution(resolution: string): string {
    if (!resolution || !RESOLUTION_MAPPING[resolution])
        return RESOLUTION_MAPPING["1"];

    return RESOLUTION_MAPPING[resolution];
}

interface Bar {
    time: number;
    open?: number;
    high?: number;
    low?: number;
    close?: number;
    volume?: number;
}

export function getNextBarTime(lastBar: Bar | undefined, resolution: string = "1D"): number | undefined {
    if (!lastBar) return;

    const lastCharacter = resolution.slice(-1);
    let nextBarTime: number;

    switch (true) {
        case lastCharacter === "W":
            nextBarTime = 7 * 24 * 60 * 60 * 1000 + lastBar.time;
            break;

        case lastCharacter === "D":
            nextBarTime = 1 * 24 * 60 * 60 * 1000 + lastBar.time;
            break;

        default:
            nextBarTime = parseInt(resolution) * 60 * 1000 + lastBar.time;
            break;
    }

    return nextBarTime;
}

export const SUBSCRIPT_NUMBER_MAP: Record<number, string> = {
    4: "₄",
    5: "₅",
    6: "₆",
    7: "₇",
    8: "₈",
    9: "₉",
    10: "₁₀",
    11: "₁₁",
    12: "₁₂",
    13: "₁₃",
    14: "₁₄",
    15: "₁₅",
};

export const calcPricePrecision = (num: number | string | null | undefined): number => {
    if (!num) return 8;
    const numValue = Number(num);
    if (numValue <= 0) return 0;

    switch (true) {
        case Math.abs(numValue) < 0.00000000001:
            return 16;

        case Math.abs(numValue) < 0.000000001:
            return 14;

        case Math.abs(numValue) < 0.0000001:
            return 12;

        case Math.abs(numValue) < 0.00001:
            return 10;

        case Math.abs(numValue) < 0.05:
            return 6;

        case Math.abs(numValue) < 1:
            return 4;

        case Math.abs(numValue) < 20:
            return 3;

        default:
            return 2;
    }
};

export const formatPrice = (num: number | string | null | undefined, precision?: number, gr0: boolean = true): string | number => {
    if (!num) {
        return num as string | number;
    }

    if (!precision) {
        precision = calcPricePrecision(num);
    }

    let formated = Number(num).toFixed(precision);

    if (formated.match(/^0\.[0]+$/g)) {
        formated = formated.replace(/\.[0]+$/g, "");
    }

    if (gr0 && formated.match(/\.0{4,15}[1-9]+/g)) {
        const match = formated.match(/\.0{4,15}/g);
        if (match) {
            const matchString = match[0].slice(1);
            formated = formated.replace(
                /\.0{4,15}/g,
                `.0${SUBSCRIPT_NUMBER_MAP[matchString.length]}`,
            );
        }
    }

    return formated;
};

export const getCookies = (name: string): string | undefined => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
}