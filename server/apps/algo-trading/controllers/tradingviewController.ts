import { Request, Response } from "express";
import logger from "../logger";
import TradeEvent from "../events/trade";

export default class TradingviewController {

    recieveSignal = (req: Request, res: Response) => {
        const whiteListedIps = [
            '52.89.214.238',
            '34.212.75.30',
            '54.218.53.128',
            '52.32.178.7'
        ];
        const remoteAddress = req.headers['cf-connecting-ip'];
        if ((typeof remoteAddress === 'string' && whiteListedIps.includes(remoteAddress))) {
            const stringifiedBody = JSON.stringify(req.body);
            const message = `${stringifiedBody}`;
            logger.info(`Trading signal recieved. ${message}`);
            TradeEvent.emit('tradeExecutor', stringifiedBody);
            return res.sendStatus(200);
        } else {
            return res.sendStatus(400);
        }
    }

}