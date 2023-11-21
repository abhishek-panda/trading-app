import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
import * as Typings from '../../../typings';
import { tradeLogger } from '../logger';
import BaseStrategy, { POSITION_STATUS } from './strategy'; //TODO: Rename the file to basestrategy

// Currently this is a intraday strategy
export default class OptionBuyerStrategy extends BaseStrategy {

    constructor() {
        super(STRATEGY.OPTION_BUYER);
        this.init();
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
                        tradeLogger.info(`Signal: ${instrumentName} buy at ${close}`);
                        await this.placeOrder(instrument, Typings.TransactionType.BUY, close, "enter");
                    }
                    
                }

                if (status === POSITION_STATUS.HOLD && close > (instrumentDetails.anchorPrice ?? close)) {
                    tradeLogger.info(`Signal: ${instrumentName} stoploss updated to ${close} and anchorPrice is ${instrumentDetails.anchorPrice}`);
                    await this.placeOrder(instrument, Typings.TransactionType.SELL, close, "update");
                }
                
                // // Downside move
                // if (ema5 < ema9 && ema9 < ema20) {
                    
                //     // Exit if holding any CE or PE postion
                //     if (status === POSITION_STATUS.HOLD) {
                //         instrumentDetails.status = POSITION_STATUS.NONE;
                //         instrumentDetails.anchorPrice = undefined;
                //         const exitOrder = await this.placeOrder(instrumentName,  Typings.TransactionType.SELL, close, "exit");
                //         wsTickLogger.info(`Trade: ${instrumentName} sell at ${close}`);
                //     }
                // }
            }
        }
    }
};

