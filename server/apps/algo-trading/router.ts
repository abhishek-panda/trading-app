import { Router } from 'express';
import TradingviewController from './controllers/tradingviewController';
import WSController from './controllers/wsController';

function intializeAlgoWS() {
    const wsController = new WSController();
    wsController.initializeAll();
}

function intializeAlgoTradingRoutes() {
    const AlgoTradingRoute = Router();
    const tradingviewController = new TradingviewController();

    AlgoTradingRoute.post('/signal', tradingviewController.recieveSignal);
    // AlgoTradingRoute.post('/check256', tradingviewController.testCheck256);
    return AlgoTradingRoute;
}

export { intializeAlgoWS };
export default intializeAlgoTradingRoutes;