import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
import * as Typings from '../../../typings';
import { wsTickLogger } from '../logger';
import BaseStrategy, { POSITION_STATUS } from './strategy'; //TODO: Rename the file to basestrategy


export default class OptionBuyerStrategy extends BaseStrategy {

    constructor() {
        super();
        this.init(STRATEGY.OPTION_BUYER);
    }


    protected getStopLossTriggerPrice(price: number): number {
        const triggerPrice = Math.floor(price - (price * this.getStopLossPercentage()))
        return triggerPrice;
    }

    
    async watchAndExecute (instrumentData: InstrumentTA) {
        const { instrument, candles } = instrumentData;
        const instrumentDetails = this.subscribedInstruments.get(instrument);
        if (instrumentDetails && candles.length > 0) {
            const {status, strategyLeg: {name: instrumentName}} = instrumentDetails;
            const { close, ema5, ema9, ema20, timestamp } = candles[0];
            const isBetweenTradingHours = this.isBetweenTradingHours(timestamp);
            if (isBetweenTradingHours) {

                // Upside Move
                if (ema5 > ema20 && ema9 > ema20) {
                        
                    // Buy CE or PE if nothing is bought yet  
                    if(status === POSITION_STATUS.NONE) {
                        const buy = Typings.TransactionType.BUY;
                        await this.placeOrder(instrumentName, buy, close);
                        wsTickLogger.info(`Trade: ${instrumentName} buy at ${close}`);
                        instrumentDetails.status = POSITION_STATUS.HOLD;
                        instrumentDetails.anchorPrice = close;
                        wsTickLogger.info(`Trade: StopLoss set at ${this.getStopLossTriggerPrice(close)}`) 
                    }
                    
                }

                if (status === POSITION_STATUS.HOLD && close > (instrumentDetails.anchorPrice ?? close)) {
                    instrumentDetails.anchorPrice = close;
                    wsTickLogger.info(`Trade: StopLoss updated to ${this.getStopLossTriggerPrice(close)}`);
                }
                
                // Downside move
                if (ema5 < ema9 && ema9 < ema20) {
                    
                    // Exit if holding any CE or PE postion
                    if (status === POSITION_STATUS.HOLD) {
                        wsTickLogger.info(`Trade: ${instrumentName} sell at ${close}`);
                        instrumentDetails.status = POSITION_STATUS.NONE;
                        instrumentDetails.anchorPrice = undefined;
                    }
                }
            }
        }
    }
};

