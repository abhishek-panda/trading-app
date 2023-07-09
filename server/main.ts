import path from 'path';
import dotenv from 'dotenv';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import helmetCsp from 'helmet-csp';
import express, { Request, Response } from 'express';
import intializeTradingAppRoutes from './apps/trading-app/router';
import intializeAlgoTradingRoutes, { intializeAlgoWS } from './apps/algo-trading/router';
import tasks from './tasks';
import appScheduler from "./scheduler";
import * as GlobalUtils from './utils';
import { csp } from './csp';
import DBConn from './dbConn';

const app = express();


/**
 * Settings
 */
const { logger } = GlobalUtils;
const rootPath = path.join(__dirname, '..');
const envFilePath = path.join(rootPath, '.env');
dotenv.config({ path: envFilePath });
const PORT = parseInt(process.env.PORT ?? '2179');
app.disable('x-powered-by');
// End Settings

/**
 * Middleware
 */
app.use(bodyParser.json());
app.use(helmetCsp(csp));
app.use(cookieParser());
// For local only as static assest will be served from nginx
app.use(express.static(GlobalUtils.publicDirPath));

function initializeApplicationsRouters() {
    app.use('/', intializeTradingAppRoutes());
    app.use('/algo-api', intializeAlgoTradingRoutes());

    // Block all other unwanted routes
    app.use(function (req: Request, res: Response) {
        logger.info(`Invalid request. Path: ${req.path} Headers: ${JSON.stringify(req.headers)}`);
        GlobalUtils.serveIndex(res);
    });
}
// End Middleware


function initializeApplicationWS() {
    intializeAlgoWS();
}


/**
 * Schedulers
 */
tasks.forEach(task => {
    appScheduler.register(task);
})
appScheduler.run();


/**
 * Websocket for get tickers and order status
 */
// let wsTicker  = new KiteWSTicker({
//     api_key: process.env.API_KEY ?? '',
//     access_token: process.env.ACCESS_TOKEN ?? ''
// });
// wsTicker.connect();


/**
 * Starting server after DB connection is successdul
 */

DBConn.getInstance().initialize()
    .then(() => {
        initializeApplicationsRouters();
        initializeApplicationWS();
        app.listen(PORT, () => {
            logger.info(`Server started. Listening on port : ${PORT}`);
        });
    }).catch(error => {
        logger.info(`Failed to connect to datasource. ${JSON.stringify(error)}`);
    });


