import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
import * as Typings from '../../../typings';
import BaseStrategy from './strategy';


export default class DirectionalStrategy extends BaseStrategy {
    
    private continuedDirection: "upside" | "downside";
    private hasDirectionChanged: boolean = false;

    constructor(strategyType: STRATEGY) {
        super(strategyType);
        this.init();
    }

    async watchAndExecute (instrumentData: InstrumentTA) {
        const { instrument, candles } = instrumentData;
        const instrumentDetails = this.subscribedInstruments.get(instrument);
        if (instrumentDetails && candles.length > 0) {
            const { close, ema5, ema9, ema20, timestamp } = candles[0];
            const isBetweenTradingHours = this.isBetweenTradingHours(timestamp);
            if (isBetweenTradingHours) {

                // Upside Move
                if (ema5 > ema20 && ema9 > ema20) {
                    const direction = "upside";
                    this.hasDirectionChanged = this.continuedDirection ? direction !== this.continuedDirection : false;
                    await this.placeOrder(instrument, Typings.TransactionType.BUY, close, this.hasDirectionChanged);
                    this.continuedDirection = direction;
                }
                // Downside move
                else if (ema5 < ema20 && ema9 < ema20) {
                    const direction = "downside"; //19800CE
                    this.hasDirectionChanged = this.continuedDirection ? direction !== this.continuedDirection : false;
                    await this.placeOrder(instrument, Typings.TransactionType.SELL, close, this.hasDirectionChanged);
                    this.continuedDirection = direction;
                }
                // Continue direction
                else {
                    const transactionType = this.continuedDirection === 'upside' ? Typings.TransactionType.BUY : Typings.TransactionType.SELL;
                    await this.placeOrder(instrument, transactionType, close);
                }

            }
        }
    }

}