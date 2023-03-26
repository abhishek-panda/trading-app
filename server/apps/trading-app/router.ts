import { Router, Request, Response, NextFunction } from 'express';
import * as GlobalUtils from '../../utils';
import { User } from '../shared/entities/User';
import DBConn from '../../dbConn';

const TradingAppRouter = Router();


TradingAppRouter.get('/', async (req: Request, res: Response) => {
    // const dbConn = DBConn.getInstance();
    // const userRepository = dbConn.getRepository(User);
    // const user = new User()
    // user.firstName = "Timber";
    // user.lastName = "Saw";
    // user.age = 25;
    // const result = await userRepository.save(user);
    // console.log("Result", result);
    GlobalUtils.serveIndex(res);
});

export default TradingAppRouter;