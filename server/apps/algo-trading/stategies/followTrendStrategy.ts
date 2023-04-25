import * as Utils from '../utils';
import * as Typings from '../typings';
//import * as Kite from './../kite';
import * as GlobalUtils from '../../../utils';
import logger from '../logger';
const Kite =  require('./../core/kite-connect');

/**
 * This strategy is variation of forwarded bull-put spread or forwarded bear-call spread depending on the current trend.
 * 
 * 
 */

export default async function followTrendStrategy(signal: Typings.Signal, tickerLastPrice: number): Promise<Typings.StrategyOrder | undefined> {
    let contractExpiryDate;
    let strategyOrder : Typings.StrategyOrder | undefined;
    const today =  GlobalUtils.getLocalDateTime(new Date());
    const calenderDate = today.getDate();
    const shouldConsiderNextExpiry = calenderDate > Utils.EXPIRY_THRESHOLD_DATE;
    if (shouldConsiderNextExpiry) {
        const nextMonth = GlobalUtils.getNextMonth(today);
        contractExpiryDate = Utils.getMonthlyLastExipryDate(nextMonth.getFullYear(), nextMonth.getMonth(), Typings.WEEKDAYS.THRUSDAY);
    } else {
        contractExpiryDate = Utils.getMonthlyLastExipryDate(today.getFullYear(), today.getMonth(), Typings.WEEKDAYS.THRUSDAY);
    }
    if (contractExpiryDate) {
                    
        const daysToExpire = GlobalUtils.getDaysInBetween(today, contractExpiryDate);
        const expectedPercentageMove = Utils.expectedPercentageMove(daysToExpire);
        
        let transactionType: Typings.TransactionType | undefined;
        let optionType: Typings.OPTION | undefined;
        
        if (signal.signalType === 'buyenter') {
            transactionType = Typings.TransactionType.BUY;
            optionType = Typings.OPTION.PE;
        }
        if (signal.signalType === 'sellenter') {
            transactionType = Typings.TransactionType.SELL;
            optionType = Typings.OPTION.CE;
        }

        if (transactionType && optionType ) {
            const targetPrices = Utils.getTargetPrices(tickerLastPrice, expectedPercentageMove, transactionType);
            const positionContractTicker = Utils.getMonthlyContractTicker(contractExpiryDate, signal.ticker, targetPrices.position, optionType);
            const hedgeContractTicker = Utils.getMonthlyContractTicker(contractExpiryDate, signal.ticker, targetPrices.hedge, optionType);

            const positionalBasketOrder : Typings.BasketOrderItem = {
                exchange: Typings.Exchange.NFO,
                tradingsymbol: positionContractTicker,
                transaction_type: Typings.TransactionType.SELL,
                variety: "regular",
                product: Typings.ProductType.NRML,
                order_type: Typings.OderType.MARKET,
                quantity: 50,
                price: 0,
                trigger_price: 0,
            };
            const hedgeBasketOrder : Typings.BasketOrderItem = {
                exchange: Typings.Exchange.NFO,
                tradingsymbol: hedgeContractTicker,
                transaction_type: Typings.TransactionType.BUY,
                variety: "regular",
                product: Typings.ProductType.NRML,
                order_type: Typings.OderType.MARKET,
                quantity: 50,
                price: 0,
                trigger_price: 0,
            }

            let userAvailableMargin = 0;
            let basketMarginRequired = 0;
            const [userMargin, basketMargin] = await Promise.all([
                Kite.getMargin(),
                Kite.getBasketMargin([hedgeBasketOrder, positionalBasketOrder]) // Basket order item are important to reduce margin price
            ]);
            
            if (!(userMargin instanceof Error) && userMargin?.available) {
                userAvailableMargin = userMargin?.available?.live_balance ?? 0;
            }
            if (!(basketMargin instanceof Error) && basketMargin?.initial) {
                basketMarginRequired = basketMargin?.initial?.total ?? 0;
            }

            if (userAvailableMargin > basketMarginRequired) {
                strategyOrder = {
                    ticker: signal.ticker,
                    id: signal.id,
                    transaction: transactionType,
                    orders: [hedgeBasketOrder, positionalBasketOrder], // Basket order item are important to reduce margin price
                    timeFrame: signal.timeFrame
                };
            } else {
                logger.info("Insufficient margin available");
            }
        }
       
    }
    return strategyOrder;
}