import { Request, Response } from "express";
import TradeSetupModel from "../models/tradeSetupModel";
import BaseController from "./baseController";
import { User } from "../../../../libs/typings";
import * as GlobalUtils from '../../../utils';

export default class TradeSetupController extends BaseController {

    private tradeSetupModel: TradeSetupModel;

    constructor() {
        super();
        this.tradeSetupModel = new TradeSetupModel();
    }

    setup = async (req: Request, res: Response) => {
        const uploadedFiles = req.files;
        //@ts-ignore
        const callfileDetails = uploadedFiles.callfile[0] as Express.Multer.File | undefined;
        //@ts-ignore
        const putfileDetails = uploadedFiles.putfile[0] as Express.Multer.File | undefined;
        if (!(callfileDetails && putfileDetails)) {
            return res.status(400).json({ error: 'No file uploaded' });
        } else {
            const userInputData = req.body;
            const userSessionId = req.cookies['SN'];
            const user = GlobalUtils.cache.get<User>(userSessionId);
            const callfilePath = callfileDetails.path;
            const putfilePath = putfileDetails.path;
            const [status, response] = await this.getStatusAndResponse(() => {
                return user ? this.tradeSetupModel.setup(userInputData, user.id, callfilePath, putfilePath) : undefined;
            });
            return res.status(status).send(response);
        }
      
    }

}