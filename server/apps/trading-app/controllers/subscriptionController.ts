import { Request, Response } from "express";
import SubscriptionModel from "../models/subscriptionModel";
import * as GlobalUtils from '../../../utils';
import { User } from "../../../../libs/typings";
import BaseController from "./baseController";

export default class SubscriptionController extends BaseController{
    
    private subscriptionModel: SubscriptionModel;
    
    constructor() {
        super();
        this.subscriptionModel = new SubscriptionModel();
    }

    subscribe = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.subscriptionModel.subscribe(userInputData, user.id) : undefined;
        });
        return res.status(status).send(response);
    }

    getSubscription = async (req: Request, res: Response) => {
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.subscriptionModel.fetchSubscription(user.id) : undefined;
        });
        return res.status(status).send(response);
    }

    unsubscribe = async (req: Request, res: Response) => {

    }
}