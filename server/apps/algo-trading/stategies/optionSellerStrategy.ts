// import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
// import * as Typings from '../../../typings';
// import { tradeLogger } from '../logger';
// import BaseStrategy, { POSITION_STATUS } from './strategy'; //TODO: Rename the file to basestrategy

// // Currently this is a intraday strategy
// export default class OptionSellerStrategy extends BaseStrategy {

//     constructor() {
//         super(STRATEGY.OPTION_SELLER);
//         this.init();
//     }

    
//     async watchAndExecute (instrumentData: InstrumentTA) {
//         const { instrument, candles } = instrumentData;
//         const instrumentDetails = this.subscribedInstruments.get(instrument);
//         if (instrumentDetails && candles.length > 0) {
//             const {status, strategyLeg: {name: instrumentName} } = instrumentDetails;
//             const { close, ema5, ema9, ema20, timestamp } = candles[0];
//             const isBetweenTradingHours = this.isBetweenTradingHours(timestamp);
//             if (isBetweenTradingHours) {

//                 // Downside move
//                 if (ema5 < ema9 && ema9 < ema20) {
                        
//                     // Sell CE or PE if nothing is bought yet  
//                     if(status === POSITION_STATUS.NONE) {
//                         tradeLogger.info(`Signal: Sell ${instrumentName} at ${close}`);
//                         await this.placeOrder(instrument, Typings.TransactionType.SELL, close, "enter");
//                     }
                    
//                 }

//                 if (status === POSITION_STATUS.HOLD) {
//                     tradeLogger.info(`Signal: Update order ${instrumentName} at ${close}`);
//                     await this.placeOrder(instrument, Typings.TransactionType.BUY, close, "update");
//                 }
                
                
//                 // Upside Move
//                 if (ema5 > ema20 && ema9 > ema20) {
//                     // Exit if holding any CE or PE postion
//                     if (status === POSITION_STATUS.HOLD) {
//                         tradeLogger.info(`Signal: Exit sell ${instrumentName} at ${close}`);
//                         await this.placeOrder(instrument,  Typings.TransactionType.BUY, close, "exit");
//                     }

//                     // Reset or clear anchor price for re-entry
//                     if(status === POSITION_STATUS.NONE) {
//                         tradeLogger.info(`Signal: Resetting ${instrumentName} for re-entry`);
//                         this.resetInstrumentStoplossPrice(instrument);
//                     }
//                 }
//             }
//         }
//     }
// };

