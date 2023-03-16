import express, { Request, Response, NextFunction } from 'express';
import * as path from 'path';
import logger from './logger';
import { TradeEvent } from './tradings'
import * as GlobalUtils from '../../utils';
import * as GlobalTypings from '../../typings';
const Kite =  require('./kite');


/**
 * Settings
 */
const rootPath = path.join(__dirname, '..', '..', '..');
const envFilePath = path.join(rootPath ,'.env');
const publicDirPath = path.join(rootPath, 'public');

const whiteListedIps = [
    '52.89.214.238',
    '34.212.75.30',
    '54.218.53.128',
    '52.32.178.7'
];

const whiteListedRefer = [
    'https://kite.zerodha.com/'
];

const whiteListedEndpoints = [
    '/login',
    '/check',
]

const AlgoTradingRouter = express();


/**
 * Middleware
 */
AlgoTradingRouter.disable('x-powered-by');
AlgoTradingRouter.use(routeGuard);

function routeGuard(req: Request, res: Response, next: NextFunction) {
    // use req.headers['x-forwarded-for'] or req.headers['cf-connecting-ip']
    const apiPath = req.path;
    const remoteAddress = req.headers['cf-connecting-ip'];
    const referer = req.headers.referer ?? '';

    /*
    * [ERR_HTTP_HEADERS_SENT]: Cannot set headers after they are sent to the client 
    *
    * Add return to next()
    */
    if (whiteListedRefer.includes(referer)) {
        return next();
    }

    if ((typeof remoteAddress === 'string' && whiteListedIps.includes(remoteAddress))) {
        return next();
    }

    if (whiteListedEndpoints.includes(apiPath)) {
       return next();
    }
    res.status(404).sendFile(path.join(publicDirPath, 'error.html'));
}
// End Middleware




// Routes
AlgoTradingRouter.get('/login', function(req: Request, res: Response) {
    if(process.env.ACCESS_TOKEN) {
        res.sendStatus(200);
    } else{
        res.redirect(`https://kite.zerodha.com/connect/login?v=3&api_key=${process.env.API_KEY}`);
    }
});

AlgoTradingRouter.get('/validate', async (req: Request, res: Response, next: NextFunction) => {
    const action = req.query['action'] as string ?? '';
    const type = req.query['type'] as string ?? '';
    const status = req.query['status'] as string ?? '';
    const token = req.query['request_token'] as string ?? '';
   
    if (action === 'login' && type === 'login' && status === 'success' && token !== '') {
        const accessToken = await Kite.getAccessToken(token);
        if(!(accessToken instanceof Error)) {
            process.env.ACCESS_TOKEN = accessToken;
            GlobalUtils.addRemoveEnv(envFilePath, GlobalTypings.ENV_OPERATION.ADD_REPLACE, 'ACCESS_TOKEN', accessToken);
        }
        return res.sendStatus(200);
    }
    res.status(404).sendFile(path.join(publicDirPath, 'error.html'));
});

AlgoTradingRouter.post('/signal', (req: Request, res: Response) => {
    const stringifiedBody = JSON.stringify(req.body);
    const message = `${stringifiedBody}`;
    logger.info(`Trading signal recieved. ${message}`);
    // TradeEvent.emit('tradeExecutor', stringifiedBody);
    res.sendStatus(200);
});


AlgoTradingRouter.post('/check', async (req: Request, res: Response, next: NextFunction) => {
    const stringifiedBody = JSON.stringify(req.body);
    TradeEvent.emit('tradeExecutor', stringifiedBody);
    res.sendStatus(200);
});

export default AlgoTradingRouter;