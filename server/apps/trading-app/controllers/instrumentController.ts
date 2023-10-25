import path from 'path';
import { Request, Response } from "express";
import BaseController from "./baseController";
import { User } from "../../../../libs/typings";
import * as GlobalUtils from '../../../utils';
import InstrumentModel from "../models/instrumentModel";


export default class InstrumentController extends BaseController {

    private instrumentModel: InstrumentModel;

    constructor() {
        super();
        this.instrumentModel = new InstrumentModel();
    }

    subscribe = async (req: Request, res: Response) => {
        const uploadedFile = req.file;
        let filename = uploadedFile?.filename ?? '';
        const extension = path.extname(filename);
        filename = path.basename(filename, extension);
        const filePath = uploadedFile?.path ?? '';

        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        const userInputData = req.body;
        const userSessionId = req.cookies['SN'];
        const user = GlobalUtils.cache.get<User>(userSessionId);
        const [status, response] = await this.getStatusAndResponse(() => {
           return user ? this.instrumentModel.subscribe(userInputData, user.id, filename, filePath) : undefined;
        });
        return res.status(status).send(response);
    }

    getSubscription = async (req: Request, res: Response) => {


    }

    updateSubscription = async (req: Request, res: Response) => {


    }
    
    deleteSubscription = async (req: Request, res: Response) => {


    }
    
}