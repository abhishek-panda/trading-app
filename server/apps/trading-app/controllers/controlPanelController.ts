import { Request, Response } from "express";
import ControlPanelModel from "../models/controlPanelModel";
import * as GlobalUtils from '../../../utils';
import { User, UserRole } from "../../../../libs/typings";
import BaseController from "./baseController";


export default class ControlPanelController extends BaseController {

    private controlPanelModel : ControlPanelModel;

    constructor() {
        super();
        this.controlPanelModel = new ControlPanelModel();
    }

    registerStrategy = async (req: Request, res: Response) => {
        const uploadedFiles = req.files;
        //@ts-ignore
        const callfileDetails = uploadedFiles?.callfile?.[0] as Express.Multer.File | undefined;
        //@ts-ignore
        const putfileDetails = uploadedFiles?.putfile?.[0] as Express.Multer.File | undefined;
        if (!(callfileDetails && putfileDetails)) {
            return res.status(400).json({ error: 'No file uploaded' });
        } else {
            const userInputData = req.body;
            const userSessionId = req.cookies['SN'];
            const user = GlobalUtils.cache.get<User>(userSessionId);
            const callfilePath = callfileDetails.path;
            const putfilePath = putfileDetails.path;
            const [status, response] = await this.getStatusAndResponse(() => {
                return (user && user.role === UserRole.ADMIN) ? this.controlPanelModel.registerStrategy(userInputData, user.id, callfilePath, putfilePath) : undefined;
            });
            return res.status(status).send(response);
        }
    }

    getStrategy = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.controlPanelModel.getStrategies() : undefined;
        });
        return res.status(status).send(response);
    }
}