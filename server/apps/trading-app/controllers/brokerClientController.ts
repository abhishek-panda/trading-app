import { Request, Response } from "express";
import BrokerClientModel from "../models/brokerClientModel";
import * as GlobalUtils from '../../../utils';
import { User } from "../../../../libs/typings";
import BaseController from "./baseController";


export default class BrokerClientController extends BaseController {

    private brokerClientModel : BrokerClientModel;

    constructor() {
        super();
        this.brokerClientModel = new BrokerClientModel();
    }

    registerClient = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.brokerClientModel.registerClient(userInputData, user.id) : undefined;
        });
        return res.status(status).send(response);
    }

    getClients = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.brokerClientModel.getClients(user.id) : undefined;
        });
        return res.status(status).send(response);
    }

    updateClient = async (req: Request, res: Response) => {
        const userInputData: Record<string,any> = req.body;
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.brokerClientModel.updateClient(userInputData, user.id) : undefined;
        });
        return res.status(status).send(response);
    }
}