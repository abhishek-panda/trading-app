import { Request, Response } from "express";
import BrokerClientModel from "../models/brokerClientModel";


export default class BrokerClientController {

    private brokerClientModel : BrokerClientModel;

    constructor() {
        this.brokerClientModel = new BrokerClientModel();
    }

    registerClient = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const result = await this.brokerClientModel.registerClient(userInputData, userSessionId);
        const status = result.error ? 401 : 200;
        if (!result.error) {
            delete result.data.user;
        }
        return res.status(status).send(result);
    }

    getClients = async (req: Request, res: Response) => {

    }

    updateClient = async (req: Request, res: Response) => {

    }
}