import { Router } from 'express';
import HomeController from './controllers/homeController';
import UserController from './controllers/userController';
import BrokerClientController from './controllers/brokerClientController';
import ControlPanelController from './controllers/controlPanelController';
import SubscriptionController from './controllers/subscriptionController';
import upload from '../../upload';


function intializeTradingAppRoutes() {
    const TradingAppRouter = Router();
    const homeController = new HomeController();
    const userController = new UserController();
    const brokerClientController = new BrokerClientController();
    const controlPanelController = new ControlPanelController();
    const subscriptionController = new SubscriptionController();
    const { routeGuard } = userController;

    TradingAppRouter.get('/', homeController.default);
    TradingAppRouter.get('/api/user', routeGuard , userController.getUser);
    TradingAppRouter.post('/api/user/register', userController.registerUser);
    TradingAppRouter.post('/api/user/login', userController.loginUser);
    TradingAppRouter.get('/api/user/logout', userController.logout);
    TradingAppRouter.post('/api/broker-client', routeGuard, brokerClientController.registerClient);
    TradingAppRouter.get('/api/broker-client', routeGuard, brokerClientController.getClients);
    TradingAppRouter.put('/api/broker-client', routeGuard, brokerClientController.updateClient);
    TradingAppRouter.post('/api/strategy', routeGuard, upload.fields([{name: 'callfile', maxCount: 1}, {name: 'putfile', maxCount: 1}]), controlPanelController.registerStrategy);
    TradingAppRouter.get('/api/strategy', routeGuard, controlPanelController.getStrategy);
    TradingAppRouter.post('/api/subscription', routeGuard, subscriptionController.subscribe);
    TradingAppRouter.get('/api/subscription', routeGuard, subscriptionController.getSubscription);
    TradingAppRouter.put('/api/subscription', routeGuard, subscriptionController.updateSubscription);
    return TradingAppRouter;
}

export default intializeTradingAppRoutes;