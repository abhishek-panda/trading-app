import { Request, Response } from "express";
import UserModel from '../models/userModel';


export default class UserController {
    
    private userModel: UserModel;

    constructor() {
        this.userModel = new UserModel();
    }

    getUser = async (req: Request, res: Response) => {
        const authorizationHeader = req.headers.authorization;
        const result = await this.userModel.getUser(authorizationHeader);
        const status = result.error ? 401 : 200;
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
        res.sendStatus(401);
    }

} 
