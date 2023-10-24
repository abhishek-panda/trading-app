import { Request, Response } from "express";
import BaseController from "./baseController";
import {parse} from 'papaparse';
import fs from 'fs';

export default class InstrumentController extends BaseController {

    constructor() {
        super();
    }

    subscribe = async (req: Request, res: Response) => {
        const uploadedFile = req.file;

        console.log(uploadedFile?.filename);

        if (!uploadedFile) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        fs.readFile(uploadedFile.path, 'utf8', (error, data) => {
            if (!error) {
                const results = parse(data, { header: true }).data;
                res.json(results);
              } else {
                res.status(500).json({ error: 'Error parsing CSV file' });
              }
        });
    }

    getSubscription = async (req: Request, res: Response) => {


    }

    updateSubscription = async (req: Request, res: Response) => {


    }
    
    deleteSubscription = async (req: Request, res: Response) => {


    }
    
}