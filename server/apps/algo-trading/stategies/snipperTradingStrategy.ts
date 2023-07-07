import BaseStrategy from "./baseStrategy"
import * as Typings from '../../../typings';
import * as Utils from '../../../utils';
import * as GlobalUtils from "../../../utils";
import logger from "../logger";
import { v4 as uuidv4 } from 'uuid';
import { TRADE_STATUS } from "../../../../libs/typings";

export default class SnipperTradingStrategy extends BaseStrategy {

    async process(signal: Typings.Signal) {
        const quantity = 1;
        const lotSize = 50;
        const tickerName = Utils.TICKER[signal.ticker];
        const currentTicker = `${Typings.Exchange.NSE}:${tickerName}`; // "NSE:NIFTY 50"
        const kiteConnect = this.getKiteConnect();
        const accessToken = this.getKiteConnectAccessToken();
        const currentTickerQuote = await kiteConnect.getQuote(accessToken, [currentTicker]);
    }
}