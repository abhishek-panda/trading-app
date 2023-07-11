import * as Schedule from 'node-schedule';
import { AppSchedulerTask } from "../scheduler";
import logger from '../apps/algo-trading/logger';
import TradeEvent from "../apps/algo-trading/events/trade";
import { TradingTimeFrame } from '../../libs/typings'

/**
 * Intraday Cleanup Task
 * TODO: Force exit all naked option buying trade at 3:16PM
 */
const rule = new Schedule.RecurrenceRule();
rule.hour = 15;
rule.minute = 12;
rule.tz = process.env.TZ ?? 'Asia/Kolkata';

function intradayTradeCleanUpTaskCallback() {
    logger.info(`Initiating intraday cleanup...`);
    const signals = [];
    for (const value in TradingTimeFrame) {
        //@ts-ignore
        const timeFrame: string = TradingTimeFrame[value];
        const forceExitSignal = {
            "id": "SNIPPER_TRADE",
            "title": "Snipper Trading System",
            "signalType": "forceexit",
            "ticker": "NIFTY",
            "timeFrame": timeFrame
        };
        signals.push(forceExitSignal);
    }
    const stringifiedSignal = JSON.stringify(signals);
    logger.info(`Force exit signal recieved. ${stringifiedSignal}`);
    TradeEvent.emit('tradeExecutor', stringifiedSignal);
}


const tradeCleanUpTask: AppSchedulerTask = {
    rule,
    callback: intradayTradeCleanUpTaskCallback
}

export default tradeCleanUpTask;