import { Request, Response } from "express";
import UserModel from '../models/userModel';


export default class UserController {
    
    private userModel: UserModel;

    constructor() {
        this.userModel = new UserModel();
    }

    getUser = async (req: Request, res: Response) => {
        const authorizationHeader = req.headers.authorization;
        if (authorizationHeader) {
            const result = await this.userModel.getUser(authorizationHeader);
            return result ? res.status(200).send(result) : res.sendStatus(401);
        }
        return res.sendStatus(401);
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
