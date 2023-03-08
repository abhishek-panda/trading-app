import * as Typings from './typings';
import * as GlobalUtils from '../../utils';

export const EXPIRY_THRESHOLD_DATE = 15;
export const TICKER : Record<string, string | undefined>=  {
    "NIFTY" : "NIFTY 50",
}

export function getMonthlyLastExipryDate(year: number, month: number, exipryDay: Typings.WEEKDAYS): Date {
    /**
     * Note: Wrap new Date with getLocalDateTime to adjust local time offset
     */
    const lastDayOfMonth = GlobalUtils.getLocalDateTime(new Date(year, month+1, 0)); // points to last day of Month
    const lastWeekday =  lastDayOfMonth.getDay();
    /**
     * getDay() will remove the day of week Sunday won't be exclude as Sunday is 0
     * 
     * 3 => Minus remaining days to reach Thrusday i.e. Sunday, Saturday, Friday
     */
    if (lastWeekday < exipryDay) {
        lastDayOfMonth.setDate(lastDayOfMonth.getDate() - lastDayOfMonth.getDay() - (exipryDay - 1));
    } else if (lastWeekday === exipryDay) {
        lastDayOfMonth.setDate(lastDayOfMonth.getDate());
    } else {
        const extraday = lastWeekday - exipryDay;
        lastDayOfMonth.setDate(lastDayOfMonth.getDate() - extraday);
    }
    
    return lastDayOfMonth;
}

export function getMonthlyContractTicker (date: Date, ticker : string, strikePrice: number, option: Typings.OPTION): string {
    const monthsIdentifier = [
        "JAN",
        "FEB",
        "MAR",
        "APR",
        "MAY",
        "JUN",
        "JUL",
        "AUG",
        "SEP",
        "OCT",
        "NOV",
        "DEC"
    ];
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();
    const monthIdentifier = monthsIdentifier[currentMonth];
    const yearIdentifier = currentYear % 100;
    const contractTicker = `${ticker}${yearIdentifier}${monthIdentifier}${strikePrice}${option}`; //NIFTY23MAR11000CE
    return contractTicker;
}

export function expectedPercentageMove (daysRemaining: number): number {
    let percentage = 0;
    if (1 <= daysRemaining && daysRemaining <=  10) {
        percentage = 1;
    }
    if (11 <= daysRemaining && daysRemaining <=  15) {
        percentage = 1.5;
    }
    if (16 <= daysRemaining && daysRemaining <=  20) {
        percentage = 2;
    }
    if (21 <= daysRemaining) {
        percentage = 2.5;
    }
    return percentage/100;
}


export function getTargetPrices (currentPrice: number, expectedPercentMove: number, transactionType: Typings.TransactionType ): Typings.TargetPrice {
    const  expectedPrice =  transactionType ===  Typings.TransactionType.BUY ? 
        Math.floor(currentPrice + (currentPrice*expectedPercentMove)) : 
        Math.floor(currentPrice - (currentPrice*expectedPercentMove));
    const adjustment = expectedPrice % 100;
    const basePrice = expectedPrice - adjustment;
    return {
        position: transactionType ===  Typings.TransactionType.BUY ? basePrice + 100 : basePrice - 100,
        hedge: basePrice
    };
}