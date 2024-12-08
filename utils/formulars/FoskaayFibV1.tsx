// /utils/formulars/FoskaayFibV1.tsx
export interface MarketCycle {
    startYear: number;
    endYear: number;
    name: string;
    abbreviation: string;
}

export interface FibZone {
    name: string;
    range: [number, number];
    description: string;
    color: string;
}

export interface FibLevel extends FibZone {
    percentage: number;
    price: number;
    label: string;
    isAchieved: boolean;
    achievedDate?: string;
    daysToAchieve?: number;
    progressPercentage: number;
}

export interface FibResult {
    levels: FibLevel[];
    currentPrice: number;
    pmcATH: number;
    cmcATL: number;
    cmcATH: {
        min: number;  // 141.4% level
        max: number;  // 236% level
    };
    currentZone: FibZone;
    predictionStartDate: string;
    lastUpdated: string;
}

const MARKET_CYCLES: MarketCycle[] = [
    { startYear: 2018, endYear: 2021, name: "Previous Market Cycle", abbreviation: "PMC" },
    { startYear: 2022, endYear: 2025, name: "Current Market Cycle", abbreviation: "CMC" }
];

const FIB_ZONES: FibZone[] = [
    {
        name: " Early Accumulation Zone",
        range: [0.00, 50.00],
        description: "Early cycle accumulation phase - Best time to accumulate",
        color: "green"
    },
    {
        name: "Late Accumulation Zone",
        range: [50.01, 78.60],
        description: "Mid/Late cycle accumulation phase - Good time to accumulate before full bull run",
        color: "yellow"
    },
    {
        name: "Previous ATH Recovery Zone",
        range: [78.61, 124.06],
        description: "Mid cycle consolidation phase - Previous ATH recovery in progress",
        color: "gray"
    },
    {
        name: "Market Cycle Top Zone",
        range: [124.07, 236.00],
        description: "Late cycle distribution phase - Exercise caution as market cycle matures and exploring new ATHs",
        color: "red"
    }
];

// Complete Fibonacci levels with all 15 points
const FIBONACCI_LEVELS = [
    { percentage: 0.00, name: "Base Accumulation" },
    { percentage: 10.00, name: "Early Accumulation" },
    { percentage: 23.60, name: "Strategic Entry Accumulation" },
    { percentage: 38.2, name: "Value Accumulation" },
    { percentage: 50.00, name: "Mid-Cycle Entry Accumulation" },
    { percentage: 61.00, name: "Golden Ratio Entry Accumulation" },
    { percentage: 78.00, name: "Final Accumulation" },
    { percentage: 100, name: "Previous ATH Recovery" },
    { percentage: 124.6, name: "Early Profit Taking Zone" },
    { percentage: 141.4, name: "Breakout Profit Taking Zone" },
    { percentage: 161.80, name: "Golden Extension Profit Taking Zone" },
    { percentage: 180.00, name: "Major Extension Profit Taking Zone" },
    { percentage: 200.00, name: "Double Previous Market Cycle ATH Profit Taking Zone" },
    { percentage: 216.8, name: "Over-Extended Rally Profit Taking Zone" },
    { percentage: 236.00, name: "Maximum Extension Profit Taking Zone" }
];

export const calculateFibLevels = (
    pmcATH: number,
    cmcATL: number,
    currentPrice: number,
    predictionStartDate: string,
    historicalPrices?: { time: string; close: number }[]
): FibResult => {
    // Calculate using logarithmic scale
    const logPMCATH = Math.log(pmcATH);
    const logCMCATL = Math.log(cmcATL);
    const logRange = logPMCATH - logCMCATL;

    const levels = FIBONACCI_LEVELS.map(level => {
        // For retracements (0-100%)
        let price;
        if (level.percentage <= 100) {
            const logPrice = logCMCATL + (logRange * (level.percentage / 100));
            price = Math.exp(logPrice);
        }
        // For extensions (>100%)
        else {
            const extension = (level.percentage - 100) / 100;
            const logExtension = logRange * extension;
            price = Math.exp(logPMCATH + logExtension);
        }

        const isAchieved = currentPrice >= price;
        let achievedDate;
        let daysToAchieve;

        if (isAchieved && historicalPrices) {
            const achievementPoint = historicalPrices.find(p => p.close >= price);
            if (achievementPoint) {
                achievedDate = achievementPoint.time;
                daysToAchieve = Math.floor(
                    (new Date(achievedDate).getTime() - new Date(predictionStartDate).getTime())
                    / (1000 * 60 * 60 * 24)
                );
            }
        }

        const zone = FIB_ZONES.find(z =>
            level.percentage >= z.range[0] && level.percentage <= z.range[1]
        )!;

        return {
            ...zone,
            percentage: level.percentage,
            price,
            label: `${level.percentage}% - ${level.name} ($${price.toLocaleString()})`,
            isAchieved,
            achievedDate,
            daysToAchieve,
            progressPercentage: Math.min(
                100,
                ((currentPrice - cmcATL) / (price - cmcATL)) * 100
            )
        };
    });

    const currentZone = FIB_ZONES.find(zone => {
        const logZonePrice = logCMCATL + (logRange * (zone.range[1] / 100));
        const zonePrice = Math.exp(logZonePrice);
        return currentPrice <= zonePrice;
    })!;

    // Calculate min and max ATH predictions using logarithmic scale
    const logMinCMCATH = logPMCATH + (logRange * 0.414); // 141.4% - 100% = 41.4% additional extension
    const logMaxCMCATH = logPMCATH + (logRange * 1.36); // 236% - 100% = 136% additional extension

    const cmcATH = {
        min: Math.exp(logMinCMCATH),
        max: Math.exp(logMaxCMCATH)
    };

    return {
        levels,
        currentPrice,
        pmcATH,
        cmcATL,
        cmcATH,
        currentZone,
        predictionStartDate,
        lastUpdated: new Date().toISOString()
    };
};