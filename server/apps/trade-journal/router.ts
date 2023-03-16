import { Router, Request, Response, NextFunction } from 'express';

const WebsiteRouter = Router();


WebsiteRouter.get('/', (req: Request, res: Response) => {
    res.send("Working!!!!  ---");
});

export default WebsiteRouter;