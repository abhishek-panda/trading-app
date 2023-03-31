import { Router } from 'express';
import HomeController from './controllers/homeController';
import UserController from './controllers/userController';


function intializeTradingAppRoutes() {
    const TradingAppRouter = Router();
    const homeController = new HomeController();
    const userController = new UserController(); 

    TradingAppRouter.get('/', homeController.default);
    TradingAppRouter.get('/api/user', userController.getUser);
    TradingAppRouter.post('/api/user/register', userController.registerUser);
    TradingAppRouter.post('/api/user/login', userController.loginUser);

    return TradingAppRouter;
}

export default intializeTradingAppRoutes;