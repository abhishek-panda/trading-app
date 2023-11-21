import winston from "winston";
import * as GlobalUtils from '../../utils';

/**
 * 
 Npm log Levels
    error: 0, 
    warn: 1, 
    info: 2, 
    http: 3,
    verbose: 4, 
    debug: 5, 
    silly: 6
 * Algo log settings
 */

const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports:[
        new winston.transports.File({
            dirname: 'logs',
            filename: 'algo.log',
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: 'ALGO' }), winston.format.timestamp({ format : function() {
                return GlobalUtils.getLocalDateTime().toISOString();
                }}), GlobalUtils.logFormat)
        })
    ]
});



export const wsTickLogger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports:[
        new winston.transports.File({
            dirname: 'logs',
            filename: 'wstick.log',
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: 'WSTICK' }), winston.format.timestamp({ format : function() {
                return GlobalUtils.getLocalDateTime().toISOString();
                }}), GlobalUtils.logFormat)
        })
    ]
});

export const tradeLogger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports:[
        new winston.transports.File({
            dirname: 'logs',
            filename: 'trade.log',
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: 'TRADE' }), winston.format.timestamp({ format : function() {
                return GlobalUtils.getLocalDateTime().toISOString();
                }}), GlobalUtils.logFormat)
        })
    ]
});

export default logger;