import * as fs from 'fs';
import path from 'path';
import NodeCache from 'node-cache';
import winston, { format } from "winston";
import * as Typings from './typings';
import * as Yup from 'yup';
import { Response } from 'express';


export const publicDirPath = path.join(__dirname, '..', 'public');

const { printf } = format;

export const logFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
});


// Get local date time
export function getLocalDateTime(date: Date = new Date()): Date {
    const newDate = new Date(date.getTime() - (date.getTimezoneOffset() * 60 * 1000));
    return newDate;
}


export function getDaysInBetween(from: Date, to: Date): number {
    let d1 = from as any;
    let d2 = to as any;
    return Math.ceil((d1 - d2) / (1000 * 60 * 60 * 24));
}

export function moveDaysBy(day: Date, count: number): Date {
    var movedDate = new Date(day);
    movedDate.setDate(movedDate.getDate() + count);
    return movedDate;
}


export function getNextMonth(date: Date, monthsInAdvance: number = 1): Date {
    const calenderDate = date.getDate();
    const calenderMonth = date.getMonth();
    const calenderYear = date.getFullYear();
    const newMonth = (calenderMonth + monthsInAdvance) % 12;
    const incrementBy = Math.floor((calenderMonth + monthsInAdvance) / 12);
    const newYear = (calenderYear + incrementBy);
    return getLocalDateTime(new Date(newYear, newMonth, calenderDate));
}


export function addRemoveEnv(filePath: string, operation: Typings.ENV_OPERATION, key: string, value: string = ''): void {
    fs.readFile(filePath, 'utf8', function (error, data) {
        if (error) throw error;
        let tokenFound = false;
        const configurations = data.split("\n");
        let newConfigurations = '';
        if (Typings.ENV_OPERATION.ADD_REPLACE === operation) {
            newConfigurations = configurations.reduce((finalConfig, config) => {
                if (config.startsWith(key)) {
                    tokenFound = true;
                    return finalConfig += `${key}=${value}\n`;
                }
                return finalConfig += config !== '' ? `${config}\n` : config;
            }, newConfigurations);

            if (!tokenFound) {
                newConfigurations += `${key}=${value}`;
            }
        } else if (Typings.ENV_OPERATION.REMOVE === operation) {
            newConfigurations = configurations.reduce((finalConfig, config) => {
                if (config.startsWith(key)) {
                    tokenFound = true;
                    return finalConfig;
                }
                return finalConfig += config !== '' ? `${config}\n` : config;
            }, newConfigurations);
        }
        fs.writeFileSync(filePath, newConfigurations);
    });
}

export function throw404Error(res: Response): void {
    res.status(404).sendFile(path.resolve(publicDirPath, 'index.html'));
}

export function serveIndex(res: Response): void {
    res.status(200).sendFile(path.resolve(publicDirPath, 'index.html'));
}

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports: [
        new winston.transports.File({
            dirname: 'logs',
            filename: 'app.log',
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: 'APP' }), winston.format.timestamp({
                format: function () {
                    return getLocalDateTime().toISOString();
                }
            }), logFormat)
        })
    ]
});

const validRequestToken = /^[A-Za-z0-9]{3,100}$/;
export const validCid = /^[a-f\d]{8}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i;

export const validClientTokenRequestSchema = Yup.object({
    action: Yup.string().required("Required").matches(/^login/, "Invalid action"),
    cid: Yup.string().required("Required").matches(validCid, "Invalid cid"),
    request_token: Yup.string().required("Required").matches(validRequestToken, "Invalid token"),
    status: Yup.string().required("Required").matches(/^success/, "Invalid status"),
    type: Yup.string().required("Required").matches(/^login/, "Invalid type"),
});

export const cache = new NodeCache({
    stdTTL: parseFloat(process.env.COOKIE_EXPIRY_IN_HRS ?? '1') * 60 * 60,
    checkperiod: 1 * 60
});

export const EXPIRY_THRESHOLD_DATE = 15;
export const TICKER: Record<string, string | undefined> = {
    "NIFTY": "NIFTY 50",
}

export function getWeeklyExpiryDate(date: Date, forwardBy: number = 0): Date {
    const weekday = date.getDay();
    const adjustment = weekday > 4 ? (7 - weekday) + 4 : (4 - weekday);
    const forwardDays = (forwardBy * 7) + adjustment;
    return moveDaysBy(date, forwardDays);
}

export function getMonthlyLastExipryDate(year: number, month: number, exipryDay: Typings.WEEKDAYS): Date {
    /**
     * Note: Wrap new Date with getLocalDateTime to adjust local time offset
     */
    const lastDayOfMonth = getLocalDateTime(new Date(year, month + 1, 0)); // points to last day of Month
    const lastWeekday = lastDayOfMonth.getDay();
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

export function getContractTicker(date: Date, ticker: string, strikePrice: number = 0, option: Typings.OPTION, expiryType: Typings.ExpiryType) {
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
    const currentDate = date.getDate();
    const monthIdentifier = expiryType === Typings.ExpiryType.MONTHLY ? monthsIdentifier[currentMonth] : currentMonth + 1;
    const dateIdentifier = currentDate < 10 ? `0${currentDate}` : currentDate;
    const yearIdentifier = currentYear % 100;
    if (strikePrice <= 0) {
        return '';
    }
    const contractTicker = expiryType === Typings.ExpiryType.MONTHLY ?
        `${ticker}${yearIdentifier}${monthIdentifier}${strikePrice}${option}` : //NIFTY23MAR11000CE
        `${ticker}${yearIdentifier}${monthIdentifier}${dateIdentifier}${strikePrice}${option}`; // NIFTY2350417800CE
    return contractTicker;
}

export function expectedPercentageMove(daysRemaining: number): number {
    let percentage = 0;
    if (1 <= daysRemaining && daysRemaining <= 10) {
        percentage = 1;
    }
    if (11 <= daysRemaining && daysRemaining <= 15) {
        percentage = 1.5;
    }
    if (16 <= daysRemaining && daysRemaining <= 20) {
        percentage = 2;
    }
    if (21 <= daysRemaining) {
        percentage = 2.5;
    }
    return percentage / 100;
}


export function getTargetPrices(currentPrice: number, expectedPercentMove: number, transactionType: Typings.TransactionType): Typings.TargetPrice {
    const expectedPrice = transactionType === Typings.TransactionType.BUY ?
        Math.floor(currentPrice + (currentPrice * expectedPercentMove)) :
        Math.floor(currentPrice - (currentPrice * expectedPercentMove));
    const adjustment = expectedPrice % 100;
    const basePrice = expectedPrice - adjustment;
    return {
        position: transactionType === Typings.TransactionType.BUY ? basePrice + 100 : basePrice - 100,
        hedge: basePrice
    };
}