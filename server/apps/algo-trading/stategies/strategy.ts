import { BOOLEAN, ORDER_STATUS, STRATEGY } from "../../../../libs/typings";
import BrokerClient from "../../../entities/BrokerClient";
import StrategyLeg from "../../../entities/StrategyLeg";
import * as Typings from '../../../typings';
import ControlPanelModel from "../../trading-app/models/controlPanelModel";
import SubscriptionModel from "../../trading-app/models/subscriptionModel";
import KiteConnect from "../core/kite-connect";
import { tradeLogger } from "../logger";
import { POSITION_STATUS } from "./strategy-old";

interface StrategyLegDetail {
    strategyLeg: StrategyLeg,
    hedges: number[]
}


interface TradeDetail {
    status?: POSITION_STATUS,
    anchorPrice?: number;
    pendingOrder?: string;
    completedOrder?: string;
}

interface ClientDetail {
    brokerClient: BrokerClient;
    kiteConnect: KiteConnect;
    tradeBook: Map<string, TradeDetail>;// instrumentName(without NFO) ,  order_id | undefined to check order status if opened cancel order 
}


export default abstract class BaseStrategy {
    private tradeStartTime: number;
    private tradeCloseTime: number;
    private strategyType: STRATEGY;
    private readonly COMPLETED_STATES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETE, ORDER_STATUS.REJECTED];
    protected readonly STOPLOSS_PERCENT: number = 0.07; // 7%
    protected readonly MAX_STOPLOSS_PRICE = 10; // in Rs
    protected readonly RE_ENTRY_ABOVE_PERCENT = 0.05;
    protected subscribedInstruments: Map<number, StrategyLegDetail> = new Map();
    // Note: Make sure all the clients are active before starting algo
    protected clientDetails: ClientDetail[] = [];

    constructor(strategyType: STRATEGY) {
        this.tradeStartTime = parseInt((process.env.TRADE_START_HR ?? '') + (process.env.TRADE_START_MIN ?? ''));
        this.tradeCloseTime = parseInt((process.env.TRADE_CLOSE_HR ?? '') + (process.env.TRADE_CLOSE_MIN ?? ''));
        this.strategyType = strategyType;
    }

    protected async init() {
        // Preprocessing
        const subscribedInstruments = await (new ControlPanelModel()).getStrategyLegs(this.strategyType);
        if (subscribedInstruments.length) {
            this.subscribedInstruments = subscribedInstruments.reduce((accumulator, leg) => {
                const id = parseInt(leg.instrumentId);
                const optionType = leg.name.slice(-2)
                let hedges: number[] = [];
                if (this.strategyType === STRATEGY.OPTION_SELLER) {
                    hedges = subscribedInstruments.reduce(function (saccumulator, sLeg){
                        const sid = parseInt(sLeg.instrumentId);
                        if (sLeg.isHedge === BOOLEAN.TRUE && sLeg.name.endsWith(optionType) && id !== sid) {
                            saccumulator.push(sid);
                        }
                        return saccumulator;
                    }, hedges);
                }
                const strategyLegDetail: StrategyLegDetail = {
                    strategyLeg: leg,
                    hedges: hedges,
                };
                accumulator.set(id, strategyLegDetail);
                return accumulator;
            }, this.subscribedInstruments);
        }

        const brokerClients = await (new SubscriptionModel()).getBrokerClients(this.strategyType);

        for (const client of brokerClients) {
            const kiteConnect = new KiteConnect(client.apiKey);
            const profile = await kiteConnect.getProfile(client.accessToken);
            if ((profile instanceof Error)) {
                tradeLogger.info(`${client.apiKey} is not active`);
            } else {
                let tradeBook = new Map();
                const clientDetail: ClientDetail = {
                    brokerClient: client,
                    kiteConnect,
                    tradeBook,
                };
                this.clientDetails.push(clientDetail);
                await this.clearOpenOrder(kiteConnect, client.accessToken, clientDetail.tradeBook);
            }
        }
    }

    async placeOrder(intrumentId: number,transaction_type: Typings.TransactionType, price: number, hasDirectionChanged: boolean = false) {
        const instrumentDetails = this.subscribedInstruments.get(intrumentId);
        if (instrumentDetails) {
            const quantity = 1;
            const lotSize = 50;
            const {strategyLeg: {name: subscribedInstrumentName},  hedges = []} = instrumentDetails;
            const subscribedInstrumentSymbol = subscribedInstrumentName.split(":")[1];  // NIFTY23NOV19800CE
            for(let client of this.clientDetails) {
                const {kiteConnect, brokerClient, tradeBook} = client;
                const { accessToken } = brokerClient;
               
                // Setting default value if not exist for instrument trade
                if (!(tradeBook.get(subscribedInstrumentSymbol))) {
                    const tradeDetail = { status: POSITION_STATUS.NONE };
                    tradeBook.set(subscribedInstrumentSymbol, tradeDetail);
                    tradeLogger.info(`Setting default value for ${subscribedInstrumentSymbol}: ${JSON.stringify(tradeDetail)}`);
                }
                
                let subscribedInstrumentTrade = tradeBook.get(subscribedInstrumentSymbol);
                
                if (subscribedInstrumentTrade?.status === POSITION_STATUS.NONE) {
                    
                    if (
                        // No meaning of buy(exit) as a option seller if not holding any position 
                        (this.strategyType === STRATEGY.OPTION_SELLER && transaction_type === Typings.TransactionType.BUY) ||
                        //  No meaning of sell(exit) as a option buyer if not holding any position 
                        (this.strategyType === STRATEGY.OPTION_BUYER && transaction_type === Typings.TransactionType.SELL)
                    ) {
                        continue;
                    }
                    
                    // New entry
                    tradeLogger.info("New Entry....");
                    let basketOrder = [];
                    let shouldPlaceOrder = false;

                    if (this.strategyType === STRATEGY.OPTION_BUYER) {
                       // If anchor price is undefined then its fresh entry else its a re-entry
                       const { anchorPrice = 0 } = subscribedInstrumentTrade;
                       const thresholdEntry = anchorPrice + (anchorPrice * this.RE_ENTRY_ABOVE_PERCENT);
                       shouldPlaceOrder = price > thresholdEntry;
                    }

                    if (this.strategyType === STRATEGY.OPTION_SELLER) {
                        // If anchor price is undefined then its fresh entry else its a re-entry
                        const { anchorPrice = Number.MAX_SAFE_INTEGER } = subscribedInstrumentTrade;
                        const thresholdEntry = anchorPrice - (anchorPrice * this.RE_ENTRY_ABOVE_PERCENT);
                        shouldPlaceOrder = price < thresholdEntry;
                    }
                    
                    if (shouldPlaceOrder === false) {
                        tradeLogger.info(`Can't place order, doesn't satisfy condition`);
                        continue;
                    }

                    if (this.strategyType === STRATEGY.OPTION_SELLER) {
                        hedges.forEach((id) => {
                            const hedgeInstrumentDetails = this.subscribedInstruments.get(id);
                            if (hedgeInstrumentDetails) {
                                const {strategyLeg: {name: hedgeInstrumentName}} = hedgeInstrumentDetails;
                                const hedgeInstrumentSymbol = hedgeInstrumentName.split(":")[1];
                                // NIFTY23NOV20200CE
                                const hedgeTrade = tradeBook.get(hedgeInstrumentSymbol);
                                if (!(hedgeTrade?.completedOrder)) {
                                    const hedgeOrder: Typings.BasketOrderItem = {
                                        exchange: Typings.Exchange.NFO,
                                        tradingsymbol: hedgeInstrumentSymbol,
                                        transaction_type: Typings.TransactionType.BUY,
                                        variety: "regular",
                                        product: Typings.ProductType.MIS,
                                        order_type: Typings.OderType.MARKET,
                                        quantity: lotSize * quantity,
                                        price: 0,
                                        trigger_price: 0,
                                    };
                                    basketOrder.push(hedgeOrder);
                                }
                            }
                        });
                    }

                    const tradeOrder: Typings.BasketOrderItem = {
                        exchange: Typings.Exchange.NFO,
                        tradingsymbol: subscribedInstrumentSymbol,
                        transaction_type: transaction_type,
                        variety: "regular",
                        product: Typings.ProductType.MIS,
                        order_type: Typings.OderType.MARKET,
                        quantity: lotSize * quantity,
                        price: 0,
                        trigger_price: 0,
                    };

                    basketOrder.push(tradeOrder);

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
                         * current and next weekly contract which are highly liquild, so its not required. But their is a change of 
                         * Freak trade and Slippage
                        */
                        for (const [index, order] of basketOrder.entries()) {
                            // First check if there are any existing order either pending of fullfiled
                            await this.clearOpenOrder(kiteConnect, accessToken, tradeBook);
                            const newOrderId = await kiteConnect.placeOrder(accessToken, "regular", order);

                            if (!(newOrderId instanceof Error)) {
                                const tradeObj = {
                                    pendingOrder: newOrderId,
                                    status: POSITION_STATUS.NONE
                                };
                                let tradeDetail = tradeBook.get(order.tradingsymbol);
                                tradeDetail = tradeDetail ? { ...tradeDetail, ...tradeObj} : tradeObj;
                                tradeBook.set(order.tradingsymbol, tradeDetail);
                                tradeLogger.info(`New Order ${JSON.stringify(tradeDetail)}`);
                                
                                await (new Promise((resolve) => {
                                    const interval = setInterval(async () => {
                                        const orderStatusDetail = await kiteConnect.getOrderStatus(accessToken, newOrderId);
                                        if (!(orderStatusDetail instanceof Error) && Array.isArray(orderStatusDetail)) {
                                            if (orderStatusDetail.length > 0) {
                                                const { status: orderStatus, average_price: executedPrice } = orderStatusDetail[0];
                                                if (this.COMPLETED_STATES.includes(orderStatus)) {
                                                    if (orderStatus === ORDER_STATUS.CANCELLED || orderStatus === ORDER_STATUS.REJECTED) {
                                                        const tempTradeDetail = {
                                                            ...tradeDetail,
                                                            pendingOrder: undefined,
                                                            completedOrder: undefined,
                                                            status: POSITION_STATUS.NONE
                                                        };
                                                        tradeBook.set(order.tradingsymbol, tempTradeDetail);
                                                        tradeLogger.info(`${brokerClient.apiKey} failed to executed ${order.tradingsymbol}`);
                                                    }

                                                    if (orderStatus === ORDER_STATUS.COMPLETE) {
                                                        const tempTradeDetail = {
                                                            ...tradeDetail,
                                                            pendingOrder: undefined,
                                                            completedOrder: newOrderId,
                                                            status: POSITION_STATUS.HOLD,
                                                            anchorPrice: executedPrice
                                                        };
                                                        tradeBook.set(order.tradingsymbol, tempTradeDetail);
                                                        tradeLogger.info(`${brokerClient.apiKey} executed ${order.tradingsymbol} at ${executedPrice}`);
                                                    }
                                                    clearInterval(interval);
                                                    resolve(undefined);
                                                }
                                            }
                                        }
                                        
                                    }, 500);
                                }));

                                // Place a stop loss order
                                /**
                                 * Assuming the first order is hedge order for option seller
                                 * Place stoploss order for everything execept hedge trade.
                                 */
                                if (!(this.strategyType === STRATEGY.OPTION_SELLER && index === 0)) {
                                    const lastTradeDetail = tradeBook.get(order.tradingsymbol); //19800CE
                                    if (lastTradeDetail?.status === POSITION_STATUS.HOLD && (lastTradeDetail.anchorPrice ?? 0) > 0) {
                                        const stopLossPrice = this.getStopLossTriggerPrice(lastTradeDetail.anchorPrice ?? 0);
                                        const stopLossOrder: Typings.BasketOrderItem = {
                                            exchange: Typings.Exchange.NFO,
                                            tradingsymbol: order.tradingsymbol,
                                            transaction_type: transaction_type === Typings.TransactionType.BUY ? Typings.TransactionType.SELL : Typings.TransactionType.BUY,
                                            variety: "regular",
                                            product: Typings.ProductType.MIS,
                                            order_type: Typings.OderType.SL,
                                            quantity: lotSize * quantity,
                                            trigger_price: stopLossPrice,
                                            price: this.strategyType === STRATEGY.OPTION_SELLER ? stopLossPrice + 1 : stopLossPrice - 1,
                                        };

                                        await this.clearOpenOrder(kiteConnect, accessToken, tradeBook);
                                        const stopLossOrderId = await kiteConnect.placeOrder(accessToken, "regular", stopLossOrder);
                                        if (!(stopLossOrderId instanceof Error)) {
                                            tradeLogger.info(`${brokerClient.apiKey} placed stoploss order for ${order.tradingsymbol} at ${stopLossPrice}`);
                                            const tradeCache = tradeBook.get(order.tradingsymbol);
                                            const tempTradeDetail = { ...tradeCache, pendingOrder: stopLossOrderId , completedOrder: tradeCache?.completedOrder};
                                            tradeBook.set(order.tradingsymbol, tempTradeDetail);
                                            tradeLogger.info(`Current trade Detail: ${JSON.stringify(tempTradeDetail)}`);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        tradeLogger.info(`${brokerClient.apiKey} has insufficient margin available to execute ${JSON.stringify(basketOrder)}. Required margin is ${JSON.stringify(basketMarginRequired)}`);
                    }
                }
                else if (subscribedInstrumentTrade?.status === POSITION_STATUS.HOLD) {
                    // update entry or exit
                    if (hasDirectionChanged) {
                        // Exit
                        const completedOrderId = subscribedInstrumentTrade.completedOrder;
                        if (completedOrderId) {
                            const tradeOrder: Typings.BasketOrderItem = {
                                exchange: Typings.Exchange.NFO,
                                tradingsymbol: subscribedInstrumentSymbol,
                                transaction_type: transaction_type,
                                variety: "regular",
                                product: Typings.ProductType.MIS,
                                order_type: Typings.OderType.MARKET,
                                quantity: lotSize * quantity,
                                price: 0,
                                trigger_price: 0,
                            };

                            const exitOrderId = await kiteConnect.placeOrder(accessToken, "regular", tradeOrder);

                            if (!(exitOrderId instanceof Error)) {
                                const tempTradeDetail = {
                                    status: POSITION_STATUS.NONE,
                                    pendingOrder: undefined,
                                    completedOrder: undefined,
                                    anchorPrice: undefined,
                                };
                                tradeBook.set(subscribedInstrumentSymbol, tempTradeDetail);
                                tradeLogger.info(`Exit Order ${JSON.stringify(tempTradeDetail)}`);
                            }
                        }

                    } else {
                        // Update
                        const pendingOrderId = subscribedInstrumentTrade.pendingOrder;
                        if (pendingOrderId) {
                            const orderDetailStatus = await kiteConnect.getOrderStatus(accessToken, pendingOrderId);
                            tradeLogger.info(`Latest state of order ${pendingOrderId} : ${JSON.stringify(orderDetailStatus)}`);
                            if (!(orderDetailStatus instanceof Error) && Array.isArray(orderDetailStatus)) {
                                if (orderDetailStatus.length > 0) {
                                    const { status, average_price } = orderDetailStatus[0];
                                    if (this.COMPLETED_STATES.includes(status)) {
                                        // Update state and mark it as completed
                                        if (status === ORDER_STATUS.COMPLETE) {
                                            tradeLogger.info(`Stoploss has been trigged. So invalidating pendingOrderId ${pendingOrderId}`);
                                            const tempTradeDetail = {
                                                pendingOrder: undefined,
                                                completedOrder: undefined,
                                                status: POSITION_STATUS.NONE,
                                                anchorPrice:  average_price, // Added this price for re-entry if price goes above
                                            };
                                            tradeBook.set(subscribedInstrumentSymbol, tempTradeDetail);
                                        } else {
                                            const tempTradeDetail = {
                                                ...subscribedInstrumentTrade,
                                                pendingOrder: undefined,
                                            };
                                            tradeBook.set(subscribedInstrumentSymbol, tempTradeDetail);
                                            tradeLogger.info(`PendingOrderId ${pendingOrderId} has been cancelled/rejected so waiting for exit signal`);
                                            // TODO: Or can place a new stoploss order
                                        }
                                    } else {
                                        const hasPriceCrossedThreshold = this.strategyType === STRATEGY.OPTION_BUYER ? (price > (subscribedInstrumentTrade.anchorPrice ?? 0)) : (price < (subscribedInstrumentTrade.anchorPrice ?? 0));
                                        if (hasPriceCrossedThreshold) {
                                            // Place update order
                                            const stopLossPrice = this.getStopLossTriggerPrice(price);
                                            tradeLogger.info(`Updating stoploss order`);
                                            const isOrderUpdated = await kiteConnect.updateOrder(accessToken, "regular", pendingOrderId, { 
                                                trigger_price: stopLossPrice,
                                                price: this.strategyType === STRATEGY.OPTION_SELLER ? stopLossPrice + 1 : stopLossPrice - 1,
                                            });
                                            if (!(isOrderUpdated instanceof Error) && isOrderUpdated) {
                                                const tempTradeDetail = tradeBook.get(subscribedInstrumentSymbol);
                                                const tradeObj = {
                                                    ...tempTradeDetail,
                                                    anchorPrice: price,
                                                    status: POSITION_STATUS.HOLD,
                                                };
                                                tradeBook.set(subscribedInstrumentSymbol, tradeObj);
                                            }
                                        } else {
                                            // Log cannot update order as price is less than anchor price.
                                            tradeLogger.info(`Curent price ${price} is less than last max price ${subscribedInstrumentTrade.anchorPrice}. So not updating stoploss order`);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }

    protected getStopLossTriggerPrice(price: number): number {
        const stopLossPrice = Math.min((price * this.STOPLOSS_PERCENT), this.MAX_STOPLOSS_PRICE);
        let triggerPrice: number = price; 
        if (this.strategyType === STRATEGY.OPTION_BUYER) {
            triggerPrice =  Math.floor(price - stopLossPrice);
        }

        if (this.strategyType === STRATEGY.OPTION_SELLER) {
            triggerPrice =  Math.floor(price + stopLossPrice);
        }
        
        return triggerPrice;
    }

    protected isBetweenTradingHours(strTime: string): boolean {
        const dateTime = new Date(strTime);
        const hours = dateTime.getHours().toString();
        const minutes = dateTime.getMinutes()
        const stringifiedMinutes = (minutes < 10 ? '0' : '') + minutes;
        const totalTime = parseInt(hours+stringifiedMinutes);
        return totalTime >= this.tradeStartTime && totalTime <= this.tradeCloseTime;
    }


    private async clearOpenOrder(kiteConnect: KiteConnect, accessToken: string, trades: Map<string, TradeDetail>) {
        const allOrders = await kiteConnect.getOrders(accessToken);
        if (!(allOrders instanceof Error) && allOrders.length > 0) {
            // Get all orders
            for(const order of allOrders) {
                const {instrument_token, status, product, order_id, tradingsymbol } = order;
                const trade = trades.get(tradingsymbol);

                // Updating state of order
                if (trade) {
                    const { pendingOrder } = trade;
                    if (pendingOrder === order_id && status === ORDER_STATUS.COMPLETE) {
                        trade.completedOrder = order_id;
                        trade.pendingOrder = undefined; 
                    }
                }

                if (
                    this.subscribedInstruments.get(instrument_token) &&
                    (status === ORDER_STATUS.OPEN || status === ORDER_STATUS.TRIGGER_PENDING) &&
                    product ===  Typings.ProductType.MIS
                ) {
                    const isOrderCancelled = await kiteConnect.cancelOrder(accessToken,"regular", order_id);
                    if (!(isOrderCancelled instanceof Error) && isOrderCancelled) {
                        tradeLogger.info(`${tradingsymbol} opened orders cancelled`);
                    }
                }
            }
        }
    }

}