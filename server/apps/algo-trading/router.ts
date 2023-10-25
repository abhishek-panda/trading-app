import { Router } from 'express';
import WSController from './controllers/wsController';

function intializeAlgoWS() {
    const wsController = new WSController();
    wsController.initializeAll();
}

function intializeAlgoTradingRoutes() {
    const AlgoTradingRoute = Router();
    // const tradingviewController = new TradingviewController();
    // AlgoTradingRoute.post('/signal', tradingviewController.recieveSignal);
    // AlgoTradingRoute.post('/check256', tradingviewController.check256);
    return AlgoTradingRoute;
}

export { intializeAlgoWS };
export default intializeAlgoTradingRoutes;