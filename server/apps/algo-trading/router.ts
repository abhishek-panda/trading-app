import { Router } from 'express';
import TradingviewController from './controllers/tradingviewController';



function intializeAlgoTradingRoutes() {
    const AlgoTradingRoute = Router();
    const tradingviewController = new TradingviewController();

    AlgoTradingRoute.post('/signal', tradingviewController.recieveSignal);
    AlgoTradingRoute.post('/check256', tradingviewController.testCheck256);
    return AlgoTradingRoute;
}


export default intializeAlgoTradingRoutes;