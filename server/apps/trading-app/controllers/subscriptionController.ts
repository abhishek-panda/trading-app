import { Request, Response } from "express";
import SubscriptionModel from "../models/subscriptionModel";
import * as GlobalUtils from '../../../utils';
import { User, IResponse } from "../../../../libs/typings";

export default class SubscriptionController {
    
    private subscriptionModel: SubscriptionModel;
    
    constructor() {
        this.subscriptionModel = new SubscriptionModel();
    }

    subscribe = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        let status: number, result: IResponse;
        if (user) {
            result = await this.subscriptionModel.subscribe(userInputData, user.id);
            status = result.error ? 401 : 200;
        } else {
            status = 401;
            result = {
                error: {
                    user: "Unauthorized"
                }
            };
        }
        return res.status(status).send(result);
    }

    getSubscription = async (req: Request, res: Response) => {
        
    }

    unsubscribe = async (req: Request, res: Response) => {

    }
}