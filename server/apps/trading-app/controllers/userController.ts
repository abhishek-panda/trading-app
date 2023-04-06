import { NextFunction, Request, Response } from "express";
import UserModel from '../models/userModel';
import * as GlobalUtils from '../../../utils';
import { User } from "../../../../libs/typings";


export default class UserController {
    
    private userModel: UserModel;

    constructor() {
        this.userModel = new UserModel();
    }

    routeGuard = async (req: Request, res: Response, next : NextFunction) => {
        // const cookies = req.cookies;
        // const authorizationHeader = cookies['SN'];
        // if (authorizationHeader) {
        //     const user = GlobalUtils.cache.get<User>(authorizationHeader);
        //     if (user?.name && user.email) {
        //         next();
        //     } else{
        //         const result = {
        //             error: {
        //                 user: "Unauthorized"
        //             }
        //         };
        //         return res.status(401).send(result);
        //     }
        // } else{
        //     const result = {
        //         error: {
        //             user: "Unauthorized"
        //         }
        //     };
        //     return res.status(401).send(result);
        // }
        next();
    }

    getUser = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const authorizationHeader = cookies['SN'];
        const result = await this.userModel.getUser(authorizationHeader);
        const status = result.error ? 401 : 200;
        if (!result.error) {
            GlobalUtils.cache.set(authorizationHeader, result.data);
        }
        return res.status(status).send(result);
    }

    // "this" is undefined because this is supposed to be route callback 
    registerUser = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const result = await this.userModel.register(userInputData);
        const status = result.error ? 400 : 200;
        res.status(status).send(result);
    }

    loginUser = async (req: Request, res: Response) => {
        const userInputData = req.body;
        const result = await this.userModel.login(userInputData);
        const status = result.error ? 401 : 200;
        if (!result.error) {
            const sessionId =  result.data.sessionId;
            delete result.data.sessionId;
            GlobalUtils.cache.set(sessionId, result.data);
            res.cookie('SN', sessionId, { httpOnly: true, sameSite: 'strict', secure: true});
        }
        return res.status(status).send(result);
    }

    logout = async (req: Request, res: Response) => {
        const cookies = req.cookies;
        const authorizationHeader = cookies['SN'];
        const result = await this.userModel.logout(authorizationHeader);
        const status = result.error ? 401 : 200;
        if (!result.error) {
            GlobalUtils.cache.del(authorizationHeader);
        }
        return res.status(status).send(result);
    }

} 
