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
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return (user && user.role === UserRole.ADMIN) ? this.controlPanelModel.registerStrategy(userInputData) : undefined;
        });
        return res.status(status).send(response);
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