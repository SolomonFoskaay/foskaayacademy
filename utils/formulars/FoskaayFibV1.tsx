// /utils/formulars/FoskaayFibV1.tsx
export interface MarketCycle {
    startYear: number;
    endYear: number;
    name: string;
    abbreviation: string;
}

export interface FoskaayFibZone {
    name: string;
    range: [number, number];
    description: string;
    color: string;
}

export interface FoskaayFibLevel extends FoskaayFibZone {
    percentage: number;
    price: number;
    label: string;
    isAchieved: boolean;
    achievedDate?: string;
    daysToAchieve?: number;
    progressPercentage: number;
}

// Interfaces for the FoskaayFIb Grading system
export interface FoskaayFibGrade {
    grade: string;
    name: string;
    range: [number, number];
    color: string;
}

export interface FoskaayFibGradeResult {
    currentGrade: FoskaayFibGrade;
    allGrades: FoskaayFibGrade[];
}

// FoskaayFibResult Interface
export interface FoskaayFibResult {
    levels: FoskaayFibLevel[];
    currentPrice: number;
    pmcATH: number;
    cmcATL: number;
    cmcATH: {
        min: number;  // 141.4% level
        max: number;  // 236% level
    };
    currentZone: FoskaayFibZone;
    predictionStartDate: string;
    lastUpdated: string;
    grade: FoskaayFibGradeResult;
    currentPercentage: number;
}

// Define market cycles explicitly
export const MARKET_CYCLES = {
    PMC: {
        name: "Previous Market Cycle",
        startDate: "2018-01-01",
        endDate: "2021-12-31",
        abbreviation: "PMC"
    },
    CMC: {
        name: "Current Market Cycle",
        startDate: "2022-01-01",
        endDate: "2025-12-31",
        abbreviation: "CMC"
    }
};

// Define the FoskaayFib Grades boundaries
const FOSKAAY_FIB_GRADES: FoskaayFibGrade[] = [
    {
        grade: "A",
        name: "Super Early Stage of Accumulation Zone (FoskaayFib Level 0.00%-23.60%)",
        range: [0.00, 23.60],
        color: "#004d00" // Deep Green
    },
    {
        grade: "B",
        name: "Early Stage of Accumulation Zone (FoskaayFib Level 23.61%-50.00%)",
        range: [23.61, 50.00],
        color: "#008000" // Medium Green
    },
    {
        grade: "C",
        name: "Mid/Late Stage of Accumulation Zone (FoskaayFib Level 50.01%-78.00%)",
        range: [50.01, 78.00],
        color: "#00cc00" // Light Green
    },
    {
        grade: "D",
        name: "Mid Stage of Previous ATH Recovery Zone (FoskaayFib Level 78.01%-100.00%)",
        range: [78.01, 100.00],
        color: "#cccc00" // Yellow
    },
    {
        grade: "E",
        name: "Super Early Stage of Market Cycle Top Zone (FoskaayFib Level 100.01%-124.60%)",
        range: [100.01, 124.60],
        color: "#ffcc00" // Light Orange
    },
    {
        grade: "F",
        name: "Early Stage of Market Cycle Top Zone (FoskaayFib Level 124.61%-141.40%)",
        range: [124.61, 141.40],
        color: "#ff9900" // Orange
    },
    {
        grade: "G",
        name: "Mid Stage of Market Cycle Top Zone (FoskaayFib Level 141.41%-161.80%)",
        range: [141.41, 161.80],
        color: "#ff6600" // Dark Orange
    },
    {
        grade: "H",
        name: "Late Stage of Market Cycle Top Zone (FoskaayFib Level 161.81%-180.00%)",
        range: [161.81, 180.00],
        color: "#ff3300" // Light Red
    },
    {
        grade: "I",
        name: "Super Late Stage of Market Cycle Top Zone (FoskaayFib Level 180.01%-200.00%)",
        range: [180.01, 200.00],
        color: "#cc0000" // Medium Red
    },
    {
        grade: "J",
        name: "Super Late Stage of Market Cycle Top Zone (FoskaayFib Level 200.01%-216.80%)",
        range: [200.01, 216.80],
        color: "#990000" // Dark Red
    },
    {
        grade: "K",
        name: "Extreme Late Stage of Market Cycle Top Zone (FoskaayFib Level 216.80%-236.00%)",
        range: [216.81, 236.00],
        color: "#660000" // Deep Red
    }
];



const FIB_ZONES: FoskaayFibZone[] = [
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
    { percentage: 38.20, name: "Value Accumulation" },
    { percentage: 50.00, name: "Mid-Cycle Entry Accumulation" },
    { percentage: 61.00, name: "Golden Ratio Entry Accumulation" },
    { percentage: 78.00, name: "Final Accumulation" },
    { percentage: 100.00, name: "Previous ATH Recovery" },
    { percentage: 124.60, name: "Early Profit Taking Zone" },
    { percentage: 141.40, name: "Breakout Profit Taking Zone" },
    { percentage: 161.80, name: "Golden Extension Profit Taking Zone" },
    { percentage: 180.00, name: "Major Extension Profit Taking Zone" },
    { percentage: 200.00, name: "Double Previous Market Cycle ATH Profit Taking Zone" },
    { percentage: 216.80, name: "Over-Extended Rally Profit Taking Zone" },
    { percentage: 236.00, name: "Maximum Extension Profit Taking Zone" }
];

// Helper function to check if a date falls within a market cycle
const isWithinCycle = (date: string, cycle: typeof MARKET_CYCLES.CMC): boolean => {
    const checkDate = new Date(date);
    const cycleStart = new Date(cycle.startDate);
    const cycleEnd = new Date(cycle.endDate);
    return checkDate >= cycleStart && checkDate <= cycleEnd;
};

// Helper function to filter historical prices by cycle
const filterPricesByCycle = (
    prices: { time: string; close: number }[],
    cycle: typeof MARKET_CYCLES.CMC
): { time: string; close: number }[] => {
    return prices.filter(price => isWithinCycle(price.time, cycle));
};

// FoskaayFib Grading function
export const calculateFoskaayFibGrade = (currentPercentage: number): FoskaayFibGradeResult => {
    // Calculate the logarithmic percentage for accurate grading
    const logCurrentPercentage = Number(currentPercentage.toFixed(2));
    
    // Find the correct grade based on the exact percentage ranges
    const currentGrade = FOSKAAY_FIB_GRADES.find(grade => {
        const min = Number(grade.range[0].toFixed(2));
        const max = Number(grade.range[1].toFixed(2));
        
        // Ensure exact boundary matching
        return logCurrentPercentage >= min && logCurrentPercentage <= max;
    }) || FOSKAAY_FIB_GRADES[0]; // Default to 'A' if somehow outside ranges

    return {
        currentGrade,
        allGrades: FOSKAAY_FIB_GRADES
    };
};

// Main FoskaayFib Level Formular Function
export const calculateFoskaayFibLevels = (
    pmcATH: number,
    cmcATL: number,
    currentPrice: number,
    predictionStartDate: string,
    historicalPrices?: { time: string; close: number }[]
): FoskaayFibResult => {
    // Calculate using logarithmic scale for percentage
    const logPMCATH = Math.log(pmcATH);
    const logCMCATL = Math.log(cmcATL);
    const logCurrentPrice = Math.log(currentPrice);
    
    // Calculate the percentage in logarithmic scale
    const logRange = logPMCATH - logCMCATL;
    const logProgress = logCurrentPrice - logCMCATL;
    const currentPercentage = (logProgress / logRange) * 100;

    // Get the grade using the logarithmic percentage
    const grade = calculateFoskaayFibGrade(currentPercentage);

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
            // Filter historical prices to current market cycle only for achievement dates
            const cycleHistoricalPrices = filterPricesByCycle(historicalPrices, MARKET_CYCLES.CMC);
            const achievementPoint = cycleHistoricalPrices.find(p => p.close >= price);
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
        lastUpdated: new Date().toISOString(),
        grade,
        currentPercentage // add this for debugging
    };
};