import { Request, Response } from "express";
import * as GlobalUtils from '../../../utils';


export default class HomeController {

    async default (_: Request, res: Response) {
        GlobalUtils.serveIndex(res);
    }

}