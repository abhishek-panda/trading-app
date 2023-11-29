// import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
// import * as Typings from '../../../typings';
// import { tradeLogger } from '../logger';
// import BaseStrategy, { POSITION_STATUS } from './strategy'; //TODO: Rename the file to basestrategy

// // Currently this is a intraday strategy
// export default class OptionBuyerStrategy extends BaseStrategy {

//     constructor() {
//         super(STRATEGY.OPTION_BUYER);
//         this.init();
//     }

    
//     async watchAndExecute (instrumentData: InstrumentTA) {
//         const { instrument, candles } = instrumentData;
//         const instrumentDetails = this.subscribedInstruments.get(instrument);
//         if (instrumentDetails && candles.length > 0) {
//             const {status, strategyLeg: {name: instrumentName}} = instrumentDetails;
//             const { close, ema5, ema9, ema20, timestamp } = candles[0];
//             const isBetweenTradingHours = this.isBetweenTradingHours(timestamp);
//             if (isBetweenTradingHours) {

//                 // Upside Move
//                 if (ema5 > ema20 && ema9 > ema20) {
                        
//                     // Buy CE or PE if nothing is bought yet  
//                     if(status === POSITION_STATUS.NONE) {
//                         tradeLogger.info(`Signal: Buy ${instrumentName} at ${close}`);
//                         await this.placeOrder(instrument, Typings.TransactionType.BUY, close, "enter");
//                     }
                    
//                 }

//                 if (status === POSITION_STATUS.HOLD) {
//                     tradeLogger.info(`Signal: Update order ${instrumentName} at ${close}`);
//                     await this.placeOrder(instrument, Typings.TransactionType.SELL, close, "update");
//                 }
                
//                 // // Downside move
//                 if (ema5 < ema9 && ema9 < ema20) {
                    
//                     // Exit if holding any CE or PE postion
//                     if (status === POSITION_STATUS.HOLD) {
//                         tradeLogger.info(`Signal: Exit buy ${instrumentName} at ${close}`);
//                         await this.placeOrder(instrument,  Typings.TransactionType.SELL, close, "exit");
//                     }


//                      // Reset or clear anchor price for re-entry
//                     if(status === POSITION_STATUS.NONE) {
//                         tradeLogger.info(`Signal: Resetting ${instrumentName} for re-entry`);
//                         this.resetInstrumentStoplossPrice(instrument);
//                     }
//                 }
//             }
//         }
//     }
// };

