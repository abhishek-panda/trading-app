import { Request, Response } from "express";
import AdminModel from "../models/adminModel";
import * as GlobalUtils from '../../../utils';
import { IResponse, User, UserRole } from "../../../../libs/typings";


export default class AdminController {

    private adminModel : AdminModel;

    constructor() {
        this.adminModel = new AdminModel();
    }

    registerStrategy = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        let status: number, result: IResponse;
        if (user && user.role === UserRole.ADMIN) {
            result = await this.adminModel.registerStrategy(userInputData);
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

    getStrategy = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const userSessionId = cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        let status: number, result: IResponse;
        if (user) {
            result = await this.adminModel.getStrategies();
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