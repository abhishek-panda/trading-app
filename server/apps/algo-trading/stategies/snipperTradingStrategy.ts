import BaseStrategy from "./baseStrategy"
import * as Typings from '../../../typings';
import * as Utils from '../../../utils';
import * as GlobalUtils from "../../../utils";
import logger from "../logger";
import { v4 as uuidv4 } from 'uuid';
import { TRADE_STATUS } from "../../../../libs/typings";

export default class SnipperTradingStrategy extends BaseStrategy {

    async process(signal: Typings.Signal) {
        const quantity = 1;
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

                    // Picking next of next expiry to minimize theta decay effect and good liquidity.
                    // Also to avoid trade overridding with trendTradingStrategy
                    let weeklyExpiryDate = Utils.getWeeklyExpiryDate(today, 1);  // NIFTY2350417700CE

                    // NIFTY23MAY17700CE
                    const monthlyExpiryDate = Utils.getMonthlyLastExipryDate(today.getFullYear(), today.getMonth(), Typings.WEEKDAYS.THRUSDAY);

                    const daysToExpire = GlobalUtils.getDaysInBetween(monthlyExpiryDate, weeklyExpiryDate);

                    const expiryDate = (daysToExpire === 0) ? monthlyExpiryDate : weeklyExpiryDate;
                    const expiryType = (daysToExpire === 0) ? Typings.ExpiryType.MONTHLY : Typings.ExpiryType.WEEKLY;

                    // Transaction Type
                    let tradeOptionType: Typings.OPTION | undefined;
                    let tradeStrikePrice: number | undefined;

                    const tradeTransactionType = Typings.TransactionType.BUY;
                    tradeStrikePrice = Utils.getClosest(currentTickerLastPrice, 50);
                    tradeOptionType = (signal.signalType === 'buyenter') ? Typings.OPTION.CE : Typings.OPTION.PE;

                    const tradeContractTicker = Utils.getContractTicker(expiryDate, signal.ticker, tradeStrikePrice, tradeOptionType, expiryType);
                    const tradeTicker = `${Typings.Exchange.NFO}:${tradeContractTicker}`; // "NFO:NIFTY2350417800CE"
                    const tradeTickerQuote = await kiteConnect.getQuote(accessToken, [tradeTicker]);

                    if (!(tradeTickerQuote instanceof Error)) {

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

                        const basketOrder = [tradeOrder];
                        let userAvailableMargin = 0;
                        let basketMarginRequired = 0;
                        const [userMargin, basketMargin] = await Promise.all([
                            kiteConnect.getMargin(accessToken),
                            kiteConnect.getBasketMargin(accessToken, basketOrder)
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
                    const basketOrder: Typings.BasketOrderItem[] = [];
                    const activeOrders = await this.getActiveOrders();
                    if (activeOrders.length > 0) {
                        let basketId = '';
                        activeOrders.forEach(order => {
                            const traderOrder: Typings.BasketOrderItem = {
                                exchange: Typings.Exchange.NFO,
                                tradingsymbol: order.ticker,
                                transaction_type: Typings.TransactionType.SELL,
                                variety: "regular",
                                product: Typings.ProductType.NRML,
                                order_type: Typings.OderType.MARKET,
                                quantity: order.quantity,
                                price: 0,
                                trigger_price: 0,
                                order_id: order.orderId
                            };
                            basketId = order.transactionId;
                            basketOrder.push(traderOrder);
                        });
                        this.placeOrder(TRADE_STATUS.EXIT, basketId, basketOrder);
                    }
                }
            }
        }
    }
}