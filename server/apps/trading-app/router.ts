import { Router } from 'express';
import HomeController from './controllers/homeController';
import UserController from './controllers/userController';
import BrokerClientController from './controllers/brokerClientController';
import AdminController from './controllers/adminController';

function intializeTradingAppRoutes() {
    const TradingAppRouter = Router();
    const homeController = new HomeController();
    const userController = new UserController();
    const brokerClientController = new BrokerClientController();
    const adminController = new AdminController();
    const { routeGuard } = userController;

    TradingAppRouter.get('/', homeController.default);
    TradingAppRouter.get('/api/user', routeGuard , userController.getUser);
    TradingAppRouter.post('/api/user/register', userController.registerUser);
    TradingAppRouter.post('/api/user/login', userController.loginUser);
    TradingAppRouter.get('/api/user/logout', userController.logout);
    TradingAppRouter.post('/api/broker-client', routeGuard, brokerClientController.registerClient);
    TradingAppRouter.get('/api/broker-client', routeGuard, brokerClientController.getClients);
    TradingAppRouter.put('/api/broker-client', routeGuard, brokerClientController.updateClient);
    TradingAppRouter.post('/api/strategy', routeGuard, adminController.registerStrategy);
    TradingAppRouter.get('/api/strategy', routeGuard, adminController.getStrategy);
    return TradingAppRouter;
}

export default intializeTradingAppRoutes;