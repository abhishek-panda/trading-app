import BaseStrategy from "./baseStrategy"
import * as Typings from '../../../typings';
import * as Utils from '../../../utils';
import * as GlobalUtils from "../../../utils";
import logger from "../logger";
import { v4 as uuidv4 } from 'uuid';

export default class IntradayStrategy extends BaseStrategy {
    
    async process(signal: Typings.Signal) {
        const DEBUG = true;
        const quantity = 1;
        const tickerName = Utils.TICKER[signal.ticker];
        const currentTicker = `${Typings.Exchange.NSE}:${tickerName}`; // "NSE:NIFTY 50"
        const kiteConnect = this.getKiteConnect();
        const accessToken = this.getKiteConnectAccessToken();
        const currentTickerQuote = await kiteConnect.getQuote(accessToken, [currentTicker]);
        const transactionId = uuidv4();
        
        if (!(currentTickerQuote instanceof Error) && currentTickerQuote[currentTicker]) {
            const currentTickerLastPrice = currentTickerQuote[currentTicker].last_price ?? 0;
            if (currentTickerLastPrice > 0) {
                const today =  GlobalUtils.getLocalDateTime(new Date());

                // Picking next of next expiry to minimize theta decay effect and good liquidity.
                const weeklyExpiryDate = Utils.getWeeklyExpiryDate(today, 1);  // NIFTY2350417700CE

                // NIFTY23MAY17700CE
                const monthlyExpiryDate = Utils.getMonthlyLastExipryDate(today.getFullYear(), today.getMonth(), Typings.WEEKDAYS.THRUSDAY); 

                const daysToExpire = GlobalUtils.getDaysInBetween(monthlyExpiryDate, weeklyExpiryDate);
                
                // No intraday on thrusday
                if (DEBUG || today.getDay() !== 4) {
                    let transactionType: Typings.TransactionType | undefined;
                    let optionType: Typings.OPTION | undefined;
                    
                    if (signal.signalType === 'buyenter') {
                        transactionType = Typings.TransactionType.BUY;
                        optionType = Typings.OPTION.CE;
                    }
                    if (signal.signalType === 'sellenter') {
                        transactionType = Typings.TransactionType.BUY;
                        optionType = Typings.OPTION.PE;
                    }
                    if (signal.signalType === 'buyexit') {
                        transactionType = Typings.TransactionType.SELL;
                        optionType = Typings.OPTION.CE;
                    }
                    if (signal.signalType === 'sellexit') {
                        transactionType = Typings.TransactionType.SELL;
                        optionType = Typings.OPTION.PE;
                    }
                    if (transactionType && optionType) {
                        const strikePrice = currentTickerLastPrice - (currentTickerLastPrice % 50);
                        const expiryDate = (daysToExpire === 0) ? monthlyExpiryDate : weeklyExpiryDate;
                        const expiryType = (daysToExpire === 0) ? Typings.ExpiryType.MONTHLY : Typings.ExpiryType.WEEKLY;
                        const contractTicker = Utils.getContractTicker(expiryDate, signal.ticker, strikePrice, optionType, expiryType);

                        const currentContractTicker = `${Typings.Exchange.NFO}:${contractTicker}`; // "NFO:NIFTY2350417800CE"
                        const currentContractTickerQuote = await kiteConnect.getQuote(accessToken, [currentContractTicker]);

                        if (!(currentContractTickerQuote instanceof Error) && currentContractTickerQuote[currentContractTicker]) {
                            const currentContractTickerLastPrice = currentContractTickerQuote[currentContractTicker].last_price ?? 0;
                            const intradayOrder : Typings.BasketOrderItem = {
                                exchange: Typings.Exchange.NFO,
                                tradingsymbol: contractTicker,
                                transaction_type: transactionType,
                                variety: "regular",
                                product: Typings.ProductType.NRML,
                                order_type: Typings.OderType.MARKET,
                                quantity: 50 * quantity,
                                price: Math.ceil(currentContractTickerLastPrice),
                                trigger_price: 0,
                            };

                            let userAvailableMargin = 0;
                            let basketMarginRequired = 0;
                            const [userMargin, basketMargin] = await Promise.all([
                                kiteConnect.getMargin(accessToken),
                                kiteConnect.getBasketMargin(accessToken, [intradayOrder]) // Basket order item are important to reduce margin price
                            ]);

                            if (!(userMargin instanceof Error) && userMargin?.available) {
                                userAvailableMargin = userMargin?.available?.live_balance ?? 0;
                            }
                            if (!(basketMargin instanceof Error) && basketMargin?.initial) {
                                basketMarginRequired = basketMargin?.initial?.total ?? 0;
                            }
                            
                            if (DEBUG || userAvailableMargin > basketMarginRequired) {
                                this.placeOrder(transactionId, intradayOrder);
                            } else {
                                logger.info("Insufficient margin available");
                            }   
                        }      
                    }
                }
            }
        }
    }
}