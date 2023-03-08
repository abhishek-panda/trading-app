import path from 'path';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import winston from 'winston';
import * as Schedule from 'node-schedule';
import express, { Request, Response } from 'express';
import TradeJournalRouter from './apps/trade-journal/router';
import { AlgoTradingRouter, KiteWSTicker } from './apps/algo-trading';
import * as GlobalTypings from './typings';
import * as GlobalUtils from './utils';

const app = express();


/**
 * Settings
 */
const envFilePath = path.join(__dirname,'..','.env');
dotenv.config({ path: envFilePath });
const PORT = process.env.PORT || 2179;
app.disable('x-powered-by');
// End Settings


// Logger Settings
const logger = winston.createLogger({
    levels: winston.config.npm.levels,
    transports:[
        new winston.transports.File({
            dirname: 'logs',
            filename: 'app.log',
            level: 'info',
            format: winston.format.combine(winston.format.label({ label: 'APP' }), winston.format.timestamp({ format : function() {
                return GlobalUtils.getLocalDateTime().toISOString();
             }}), GlobalUtils.logFormat)
        })
    ]
});


/**
 * Middleware
 */

app.use(bodyParser.json());
app.use('/', TradeJournalRouter);
app.use('/api', AlgoTradingRouter);

// Block all other unwanted routes
app.use(function (req: Request, res: Response) {
    logger.info(`Invalid request. Path: ${req.path} Headers: ${JSON.stringify(req.headers)}`);
    res.sendStatus(400);
});

// End Middleware


app.listen(PORT, () => {
    logger.info(`Server started. Listening on port : ${PORT}`);
});


/**
 * Schedulers
 */
// Clearing old request token. Need to login everyday.
const rule = new Schedule.RecurrenceRule();
rule.hour = 8;
rule.minute = 0;
rule.tz = process.env.TZ ?? 'Asia/Kolkata';
Schedule.scheduleJob(rule, function() {
    delete process.env.ACCESS_TOKEN;
    GlobalUtils.addRemoveEnv(envFilePath, GlobalTypings.ENV_OPERATION.REMOVE, 'ACCESS_TOKEN');
    logger.info('Scheduler triggered. Removing access token');
});


/**
 * Websocket for get tickers and order status
 */
let wsTicker  = new KiteWSTicker({
    api_key: process.env.API_KEY ?? '',
    access_token: process.env.ACCESS_TOKEN ?? ''
});
wsTicker.connect();