import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
import * as Typings from '../../../typings';
import { tradeLogger } from '../logger';
import BaseStrategy from './baseStrategy';


interface TrendDetail{
    continuedDirection: "upside" | "downside";
}

export default class DirectionalStrategy extends BaseStrategy {
    private instrumentTrend: Map<number, TrendDetail> = new Map();

    constructor(strategyType: STRATEGY) {
        super(strategyType);
        this.init();
    }

    async watchAndExecute (instrumentData: InstrumentTA) {
        const { instrument, candles } = instrumentData;
        const instrumentDetails = this.subscribedInstruments.get(instrument);
        if (instrumentDetails && candles.length > 0) {
            const instrumentTrend = this.instrumentTrend.get(instrument);
            const { close, ema5, ema9, ema20, timestamp } = candles[0];
            const isBetweenTradingHours = this.isBetweenTradingHours(timestamp);
            if (isBetweenTradingHours) {

                // Upside Move
                if (ema5 > ema20 && ema9 > ema20) {
                    const direction = "upside";
                    const hasDirectionChanged = instrumentTrend?.continuedDirection ? direction !== instrumentTrend.continuedDirection : false;
                    tradeLogger.info(`Upside move ${instrumentDetails.strategyLeg.name}. Direction changed: ${hasDirectionChanged}`);
                    await this.placeOrder(instrument, Typings.TransactionType.BUY, close, hasDirectionChanged);
                    this.instrumentTrend.set(instrument, { continuedDirection : direction});
                }
                // Downside move
                else if (ema5 < ema20 && ema9 < ema20) {
                    const direction = "downside"; //19800CE
                    const hasDirectionChanged = instrumentTrend?.continuedDirection ? direction !== instrumentTrend.continuedDirection : false;
                    tradeLogger.info(`Downside move ${instrumentDetails.strategyLeg.name}. Direction changed: ${hasDirectionChanged}`);
                    await this.placeOrder(instrument, Typings.TransactionType.SELL, close, hasDirectionChanged);
                    this.instrumentTrend.set(instrument, { continuedDirection : direction});
                }
                // Continue direction
                else {
                    if (instrumentTrend) {
                        const transactionType = instrumentTrend.continuedDirection === 'upside' ? Typings.TransactionType.BUY : Typings.TransactionType.SELL;
                        tradeLogger.info(`Continue move ${instrumentDetails.strategyLeg.name}.`);
                        await this.placeOrder(instrument, transactionType, close);
                    }
                }

            }
        }
    }

}