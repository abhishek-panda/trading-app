import path from 'path';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import helmetCsp from 'helmet-csp';
import * as Schedule from 'node-schedule';
import express, { Request, Response } from 'express';
import TradinAppRouter from './apps/trading-app/router';
import { AlgoTradingRouter, KiteWSTicker } from './apps/algo-trading';
import * as GlobalTypings from './typings';
import * as GlobalUtils from './utils';
import { csp } from './csp';
import DBConn from './dbConn';

const app = express();


/**
 * Settings
 */
const { logger } = GlobalUtils;
const rootPath = path.join(__dirname,'..');
const envFilePath = path.join(rootPath,'.env');
dotenv.config({ path: envFilePath });
const PORT = parseInt(process.env.PORT ?? '2179');
app.disable('x-powered-by');
// End Settings


/**
 * Middleware
 */
app.use(bodyParser.json());
app.use(helmetCsp(csp));
app.use('/', TradinAppRouter);
app.use('/api', AlgoTradingRouter);

// Block all other unwanted routes
app.use(function (req: Request, res: Response) {
    logger.info(`Invalid request. Path: ${req.path} Headers: ${JSON.stringify(req.headers)}`);
    GlobalUtils.throw404Error(res);
});

// End Middleware


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


/**
 * Starting server after DB connection is successdul
 */

DBConn.getInstance().initialize()
    .then(() => {
        app.listen(PORT, () => {
            logger.info(`Server started. Listening on port : ${PORT}`);
        });
    }).catch(error => {
        logger.info(`Failed to connect to datasource. ${JSON.stringify(error)}`);
    });