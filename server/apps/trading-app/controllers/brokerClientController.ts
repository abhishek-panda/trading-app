import { Request, Response } from "express";
import BrokerClientModel from "../models/brokerClientModel";
import * as GlobalUtils from '../../../utils';
import { IResponse, User } from "../../../../libs/typings";


export default class BrokerClientController {

    private brokerClientModel : BrokerClientModel;

    constructor() {
        this.brokerClientModel = new BrokerClientModel();
    }

    registerClient = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        let status: number, result: IResponse;
        if (user) {
            result = await this.brokerClientModel.registerClient(userInputData, user.id);
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

    getClients = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        let status: number, result: IResponse;
        if (user) {
            result = await this.brokerClientModel.getClients(user.id);
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

    updateClient = async (req: Request, res: Response) => {
        const userInputData: Record<string,any> = req.body;
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        let status: number, result: IResponse;
        if (user) {
            result = await this.brokerClientModel.updateClient(userInputData, user.id);
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
}