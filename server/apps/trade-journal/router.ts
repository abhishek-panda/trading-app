import { Router, Request, Response, NextFunction } from 'express';
import { User } from './entities/User';
import DBConn from '../../dbConn';

const WebsiteRouter = Router();


WebsiteRouter.get('/', async (req: Request, res: Response) => {
    // const dbConn = DBConn.getInstance();
    // const userRepository = dbConn.getRepository(User);
    // const user = new User()
    // user.firstName = "Timber";
    // user.lastName = "Saw";
    // user.age = 25;
    // const result = await userRepository.save(user);
    // console.log("Result", result);
    res.send("Working!!!!  ---");
});

export default WebsiteRouter;