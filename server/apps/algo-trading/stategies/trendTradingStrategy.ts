import BaseStrategy from "./baseStrategy"
import * as Typings from '../../../typings';
import * as Utils from '../../../utils';
import * as GlobalUtils from "../../../utils";
import logger from "../logger";
import { v4 as uuidv4 } from 'uuid';
import { TRADE_STATUS } from "../../../../libs/typings";

export default class TrendTradingStrategy extends BaseStrategy {

    async process(signal: Typings.Signal) {
        const quantity = 3;
        const lotSize = 50;
        const tickerName = Utils.TICKER[signal.ticker];
        const currentTicker = `${Typings.Exchange.NSE}:${tickerName}`; // "NSE:NIFTY 50"
        const kiteConnect = this.getKiteConnect();
        const accessToken = this.getKiteConnectAccessToken();
        const currentTickerQuote = await kiteConnect.getQuote(accessToken, [currentTicker]);

        if (!(currentTickerQuote instanceof Error) && currentTickerQuote[currentTicker]) {
            const currentTickerLastPrice = currentTickerQuote[currentTicker].last_price ?? 0;
            if (currentTickerLastPrice > 0) {
                if (signal.signalType === 'buyenter' || signal.signalType === 'sellenter') {
                    const basketId = uuidv4();
                    const today = GlobalUtils.getLocalDateTime();

                    // TODO: This expiry is only for Nifty contracts
                    /**
                     * 4 => Thrusday
                     */
                    const isExpiryDay = today.getDay() === 4;

                    // Picking next of next expiry to minimize theta decay effect and good liquidity.
                    let weeklyExpiryDate = Utils.getWeeklyExpiryDate(today, isExpiryDay ? 1 : 0);  // NIFTY2350417700CE

                    // NIFTY23MAY17700CE
                    const monthlyExpiryDate = Utils.getMonthlyLastExipryDate(today.getFullYear(), today.getMonth(), Typings.WEEKDAYS.THRUSDAY);

                    const daysToExpire = GlobalUtils.getDaysInBetween(monthlyExpiryDate, weeklyExpiryDate);

                    const expiryDate = (daysToExpire === 0) ? monthlyExpiryDate : weeklyExpiryDate;
                    const expiryType = (daysToExpire === 0) ? Typings.ExpiryType.MONTHLY : Typings.ExpiryType.WEEKLY;

                    // TODO: To support other index trading once this is enough liquidity.


                    // Transaction Type
                    let hedgeOptionType: Typings.OPTION | undefined;
                    let tradeOptionType: Typings.OPTION | undefined;
                    let hedgeStrikePrice: number | undefined;
                    let tradeStrikePrice: number | undefined;
                    let adjustmentPrice: number | number;
                    const hedgeTransactionType = Typings.TransactionType.BUY;
                    const tradeTransactionType = Typings.TransactionType.SELL;

                    if (signal.signalType === 'buyenter') {
                        adjustmentPrice = (currentTickerLastPrice + 50) % 50; // TODO: Add 0.6% daily average move.(P0)
                        hedgeStrikePrice = (currentTickerLastPrice + 50) - adjustmentPrice;
                        tradeStrikePrice = (currentTickerLastPrice + 100) - adjustmentPrice;
                        hedgeOptionType = tradeOptionType = Typings.OPTION.PE;
                    } else {
                        adjustmentPrice = (currentTickerLastPrice - 50) % 50;
                        hedgeStrikePrice = (currentTickerLastPrice - 50) - adjustmentPrice;
                        tradeStrikePrice = (currentTickerLastPrice - 100) - adjustmentPrice;
                        hedgeOptionType = tradeOptionType = Typings.OPTION.CE;
                    }

                    const hedgeContractTicker = Utils.getContractTicker(expiryDate, signal.ticker, hedgeStrikePrice, hedgeOptionType, expiryType);
                    const tradeContractTicker = Utils.getContractTicker(expiryDate, signal.ticker, tradeStrikePrice, tradeOptionType, expiryType);


                    const hedgeTicker = `${Typings.Exchange.NFO}:${hedgeContractTicker}`; // "NFO:NIFTY2350417800CE"
                    const hedgeTickerQuote = await kiteConnect.getQuote(accessToken, [hedgeTicker]);

                    const tradeTicker = `${Typings.Exchange.NFO}:${tradeContractTicker}`; // "NFO:NIFTY2350417800CE"
                    const tradeTickerQuote = await kiteConnect.getQuote(accessToken, [tradeTicker]);

                    if (!(hedgeTickerQuote instanceof Error || tradeTickerQuote instanceof Error)) {
                        const hedgeTickerLastPrice = hedgeTickerQuote[hedgeTicker].last_price ?? 0;
                        const hedgeOrder: Typings.BasketOrderItem = {
                            exchange: Typings.Exchange.NFO,
                            tradingsymbol: hedgeContractTicker, // NIFTY2350417800CE
                            transaction_type: hedgeTransactionType,
                            variety: "regular",
                            product: Typings.ProductType.NRML,
                            order_type: Typings.OderType.MARKET, // TODO: Avoid market orders, place limit orders true for illiquid instrument.
                            quantity: lotSize * quantity,
                            price: Math.ceil(hedgeTickerLastPrice),
                            trigger_price: 0,
                        };

                        const tradeTickerLastPrice = tradeTickerQuote[tradeTicker].last_price ?? 0;
                        const tradeOrder: Typings.BasketOrderItem = {
                            exchange: Typings.Exchange.NFO,
                            tradingsymbol: tradeContractTicker,
                            transaction_type: tradeTransactionType,
                            variety: "regular",
                            product: Typings.ProductType.NRML,
                            order_type: Typings.OderType.MARKET,
                            quantity: lotSize * quantity,
                            price: Math.ceil(tradeTickerLastPrice),
                            trigger_price: 0,
                        };
                        const basketOrder = [hedgeOrder, tradeOrder];

                        let userAvailableMargin = 0;
                        let basketMarginRequired = 0;
                        const [userMargin, basketMargin] = await Promise.all([
                            kiteConnect.getMargin(accessToken),
                            kiteConnect.getBasketMargin(accessToken, basketOrder) // Basket order item are important to reduce margin price
                        ]);

                        if (!(userMargin instanceof Error) && userMargin?.available) {
                            userAvailableMargin = userMargin?.available?.live_balance ?? 0;
                        }
                        if (!(basketMargin instanceof Error) && basketMargin?.initial) {
                            basketMarginRequired = basketMargin?.initial?.total ?? 0;
                        }

                        if (userAvailableMargin > basketMarginRequired) {
                            /**
                             * TODO: If any open order revert the basket order, true for limit order, since we are placing market order with
                             * current and next weekly contract which are highly liquild, so its not required.
                            */
                            this.placeOrder(TRADE_STATUS.ENTRY, basketId, basketOrder);
                        } else {
                            logger.info("Insufficient margin available");
                        }
                    }
                }

                if (signal.signalType === 'buyexit' || signal.signalType === 'sellexit') {
                    const basketOrders: Typings.BasketOrderItem[] = [];
                    const activeOrders = await this.getActiveOrders();
                    if (activeOrders.length > 0) {
                        let basketId = '';
                        activeOrders.forEach(order => {
                            const tradeTransactionType = order.transactionType === Typings.TransactionType.SELL ? Typings.TransactionType.BUY : Typings.TransactionType.SELL;
                            const traderOrder: Typings.BasketOrderItem = {
                                exchange: Typings.Exchange.NFO,
                                tradingsymbol: order.ticker,
                                transaction_type: tradeTransactionType,
                                variety: "regular",
                                product: Typings.ProductType.NRML,
                                order_type: Typings.OderType.MARKET,
                                quantity: order.quantity,
                                price: 0,
                                trigger_price: 0,
                                order_id: order.orderId
                            };
                            basketId = order.transactionId;
                            basketOrders.push(traderOrder);
                        });
                        basketOrders.sort((order1, order2) => {
                            return order1.transaction_type > order2.transaction_type ? 1 : -1;
                        });

                        this.placeOrder(TRADE_STATUS.EXIT, basketId, basketOrders);
                    }

                }
            }
        }
    }
}