import * as Schedule from 'node-schedule';
import { AppSchedulerTask } from "../scheduler";
import logger from '../apps/algo-trading/logger';
import TradeEvent from "../apps/algo-trading/events/trade";
import { TradingTimeFrame } from '../../libs/typings'

/**
 * Intraday Clean Task
 * TODO: Force exit all naked option buying trade at 3:15PM
 */
const rule = new Schedule.RecurrenceRule();
rule.hour = 15;
rule.minute = 16;
rule.tz = process.env.TZ ?? 'Asia/Kolkata';

function intradayTradeCleanUpTaskCallback() {
    logger.info('Force exiting intraday trades.');

    const signals = [];
    for (const value in TradingTimeFrame) {
        //@ts-ignore
        const timeFrame: string = TradingTimeFrame[value];
        const buyExitSignal = {
            "id": "SNIPPER_TRADE",
            "title": "Snipper Trading System",
            "signalType": "buyexit",
            "ticker": "NIFTY",
            "timeFrame": timeFrame
        };
        const sellExitSignal = {
            "id": "SNIPPER_TRADE",
            "title": "Snipper Trading System",
            "signalType": "sellexit",
            "ticker": "NIFTY",
            "timeFrame": timeFrame
        }
        signals.push(buyExitSignal, sellExitSignal);
    }
    TradeEvent.emit('tradeExecutor', JSON.stringify(signals));
}


const tradeCleanUpTask: AppSchedulerTask = {
    rule,
    callback: intradayTradeCleanUpTaskCallback
}

export default tradeCleanUpTask;