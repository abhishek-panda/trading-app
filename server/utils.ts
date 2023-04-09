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


export function getDaysInBetween(day1: Date, day2: Date): number {
    let d1 = day1 as any;
    let d2 = day2 as any;
    return Math.ceil(Math.abs((d1 - d2)/(1000 * 60 * 60 * 24)));
}


export function getNextMonth(date: Date, monthsInAdvance: number = 1): Date {
    const calenderDate = date.getDate();
    const calenderMonth = date.getMonth();
    const calenderYear = date.getFullYear();
    const newMonth = (calenderMonth + monthsInAdvance ) % 12;
    const incrementBy = Math.floor((calenderMonth + monthsInAdvance) / 12);
    const newYear = (calenderYear + incrementBy);
    return getLocalDateTime(new Date(newYear, newMonth, calenderDate));
}


export function addRemoveEnv (filePath: string, operation: Typings.ENV_OPERATION, key: string, value: string = '') : void {
    fs.readFile(filePath, 'utf8', function(error, data) {
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

export function throw404Error(res: Response) : void {
    res.status(404).sendFile(path.resolve(publicDirPath, 'index.html'));
}

export function serveIndex(res: Response): void {
    res.status(200).sendFile(path.resolve(publicDirPath, 'index.html'));
}

export const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports:[
        new winston.transports.File({
            dirname: 'logs',
            filename: 'app.log',
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: 'APP' }), winston.format.timestamp({ format : function() {
                return getLocalDateTime().toISOString();
             }}), logFormat)
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