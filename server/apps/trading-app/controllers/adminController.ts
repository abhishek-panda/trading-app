import { Request, Response } from "express";
import AdminModel from "../models/adminModel";
import * as GlobalUtils from '../../../utils';
import { User, UserRole } from "../../../../libs/typings";
import BaseController from "./baseController";


export default class AdminController extends BaseController {

    private adminModel : AdminModel;

    constructor() {
        super();
        this.adminModel = new AdminModel();
    }

    registerStrategy = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return (user && user.role === UserRole.ADMIN) ? this.adminModel.registerStrategy(userInputData) : undefined;
        });
        return res.status(status).send(response);
    }

    getStrategy = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
            return user ? this.adminModel.getStrategies() : undefined;
        });
        return res.status(status).send(response);
    }
}