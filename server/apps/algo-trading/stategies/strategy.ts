import EventEmitter from 'events';
import StrategyLeg from "../../../entities/StrategyLeg";
import { STRATEGY, InstrumentTA, ORDER_STATUS } from "../../../../libs/typings";
import BrokerClient from "../../../entities/BrokerClient";
import ControlPanelModel from "../../trading-app/models/controlPanelModel";
import SubscriptionModel from "../../trading-app/models/subscriptionModel";
import KiteConnect from "../core/kite-connect";
import * as Typings from '../../../typings';
import logger, {tradeLogger} from "../logger";


export enum POSITION_STATUS {
    NONE = "NONE",
    HOLD = "HOLD",
}

type ExecutionType = "enter" | "update" | "exit";


interface StrategyLegDetail {
    status: POSITION_STATUS,
    strategyLeg: StrategyLeg,
    anchorPrice: number | undefined;
}

interface TradeDetail {
    pendingOrder : string | undefined,
    completedOrder: string | undefined,
}


interface ClientDetail {
    brokerClient: BrokerClient;
    kiteConnect: KiteConnect;
    trades: Map<string, TradeDetail>;// instrumentName(without NFO) ,  order_id | undefined to check order status if opened cancel order 
}

export default abstract class BaseStrategy {
    private tradeStartTime: number;
    private tradeCloseTime: number;
    private strategyType: STRATEGY;
    private readonly COMPLETED_STATES = [ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETE, ORDER_STATUS.REJECTED];
    protected subscribedInstruments: Map<number, StrategyLegDetail> = new Map();
    protected readonly STOPLOSS_PERCENT: number = 0.07; // 7%
    protected readonly MAX_STOPLOSS_PRICE = 10; // in Rs
    protected readonly RE_ENTRY_ABOVE_PERCENT = 0.05;
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
                accumulator.set(id, {status: POSITION_STATUS.NONE, strategyLeg:leg, anchorPrice: undefined});
                return accumulator;
            }, this.subscribedInstruments);

            
            if (this.strategyType === STRATEGY.OPTION_SELLER) {
                // TODO: Add an extra hedge instrument for option selling
            }
            
        }

        const brokerClients = await (new SubscriptionModel()).getBrokerClients(this.strategyType);

        for (let count = 0; count < brokerClients.length; count++) {
            const client = brokerClients[count];
            const kiteConnect = new KiteConnect(client.apiKey);
            const profile = await kiteConnect.getProfile(client.accessToken);
            if ((profile instanceof Error)) {
                tradeLogger.info(`${client.apiKey} is not active`);
            } else {
                let trades = await this.clearOpenOrder(kiteConnect, client.accessToken);
                const clientDetail: ClientDetail = {
                    brokerClient: client,
                    kiteConnect,
                    trades,
                };
                this.clientDetails.push(clientDetail);
            }
        }
    }

    protected isBetweenTradingHours(strTime: string): boolean {
        const dateTime = new Date(strTime);
        const hours = dateTime.getHours().toString();
        const minutes = dateTime.getMinutes()
        const stringifiedMinutes = (minutes < 10 ? '0' : '') + minutes;
        const totalTime = parseInt(hours+stringifiedMinutes);
        return totalTime >= this.tradeStartTime && totalTime <= this.tradeCloseTime;
    }

    async placeOrder(intrumentId: number,transaction_type: Typings.TransactionType, price: number, executionType: ExecutionType, isStopLossOrder: boolean = false) {

        const instrumentDetails = this.subscribedInstruments.get(intrumentId);
        if (instrumentDetails) {
            const {strategyLeg: {name: instrumentName}} = instrumentDetails;
            const instrumentSymbol = instrumentName.split(":")[1];
            for(let client of this.clientDetails) {
                const {kiteConnect, brokerClient, trades} = client;
                const { accessToken } = brokerClient;
                
                if (executionType === "enter") {
                    let basketOrder = [];
                    const quantity = 1;
                    const lotSize = 50;
                    let shouldPlaceOrder = false;

                    if (this.strategyType === STRATEGY.OPTION_SELLER) {
                        // If anchor price is undefined then its fresh entry else its a re-entry
                        const { anchorPrice = Number.MAX_SAFE_INTEGER } = instrumentDetails;
                        const thresholdEntry = anchorPrice - (anchorPrice * this.RE_ENTRY_ABOVE_PERCENT);
                        shouldPlaceOrder = price < thresholdEntry;

                        // Add hedge order to basket order
                        // hedgeOrder = ..
                        // basketOrder.push(hedgeOrder);
                    } 
                    
                    if (this.strategyType === STRATEGY.OPTION_BUYER) {
                        // If anchor price is undefined then its fresh entry else its a re-entry
                        const { anchorPrice = 0 } = instrumentDetails;
                        const thresholdEntry = anchorPrice + (anchorPrice * this.RE_ENTRY_ABOVE_PERCENT);
                        shouldPlaceOrder = price > thresholdEntry;
                    }

                    if (shouldPlaceOrder === false) {
                        tradeLogger.info(`Can't place order, doesn't satisfy condition`);
                        return;
                    }


                    const tradeOrder: Typings.BasketOrderItem = {
                        exchange: Typings.Exchange.NFO,
                        tradingsymbol: instrumentSymbol,
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
                            await this.clearOpenOrder(kiteConnect, accessToken, trades);
                            const newOrderId = await kiteConnect.placeOrder(accessToken, "regular", order);
                            
                            if (!(newOrderId instanceof Error)) {
                                const tradeDetail = { pendingOrder: newOrderId , completedOrder: undefined};
                                trades.set(instrumentSymbol, tradeDetail);
                                tradeLogger.info(`New Order ${JSON.stringify(tradeDetail)}`);

                                await (new Promise((resolve) => {
                                    const tradeCache = trades.get(instrumentSymbol);
                                    const interval = setInterval(async () => {
                                        const orderStatusDetail = await kiteConnect.getOrderStatus(accessToken, newOrderId);
                                        if (!(orderStatusDetail instanceof Error) && Array.isArray(orderStatusDetail)) {
                                            if (orderStatusDetail.length > 0) {
                                                const { status: orderStatus, average_price: executedPrice } = orderStatusDetail[0];
                                                if (this.COMPLETED_STATES.includes(orderStatus)) {
                                                    if (orderStatus === ORDER_STATUS.CANCELLED || orderStatus === ORDER_STATUS.REJECTED) {
                                                        const tempTradeDetail = { pendingOrder: undefined , completedOrder: tradeCache?.completedOrder};
                                                        trades.set(instrumentSymbol, tempTradeDetail);
                                                        tradeLogger.info(`${brokerClient.apiKey} failed to executed ${instrumentSymbol}`);
                                                    }

                                                    if (orderStatus === ORDER_STATUS.COMPLETE) {
                                                        const tempTradeDetail = { pendingOrder: undefined , completedOrder: newOrderId};
                                                        trades.set(instrumentSymbol, tempTradeDetail);
                                                        instrumentDetails.anchorPrice = executedPrice;
                                                        instrumentDetails.status = POSITION_STATUS.HOLD;
                                                        tradeLogger.info(`${brokerClient.apiKey} executed ${instrumentSymbol} at ${executedPrice}`);
                                                    }
                                                    clearInterval(interval);
                                                    resolve(undefined);
                                                }
                                            }
                                        }
                                        
                                    }, 500);
                                }));

                                // Place a stop loss order
                                if (instrumentDetails.status === POSITION_STATUS.HOLD && (instrumentDetails.anchorPrice ?? 0) > 0) {
                                    
                                    /**
                                     * Assuming the first order is hedge order for option seller
                                     * Place stoploss order for everything execept hedge trade.
                                     */
                                    if (!(this.strategyType === STRATEGY.OPTION_SELLER && index === 0)) {
                                        const stopLossPrice = this.getStopLossTriggerPrice(instrumentDetails.anchorPrice ?? 0);
                                        const stopLossOrder: Typings.BasketOrderItem = {
                                            exchange: Typings.Exchange.NFO,
                                            tradingsymbol: instrumentSymbol,
                                            transaction_type: transaction_type === Typings.TransactionType.BUY ? Typings.TransactionType.SELL : Typings.TransactionType.BUY,
                                            variety: "regular",
                                            product: Typings.ProductType.MIS,
                                            order_type: Typings.OderType.SL,
                                            quantity: lotSize * quantity,
                                            price: stopLossPrice - 1,
                                            trigger_price: stopLossPrice,
                                        };
                                    
                                        await this.clearOpenOrder(kiteConnect, accessToken, trades);
                                        const stopLossOrderId = await kiteConnect.placeOrder(accessToken, "regular", stopLossOrder);
                                        if (!(stopLossOrderId instanceof Error)) {
                                            tradeLogger.info(`${brokerClient.apiKey} placed stoploss order for ${instrumentSymbol} at ${stopLossPrice}`);
                                            const tradeCache = trades.get(instrumentSymbol);
                                            const tempTradeDetail = { pendingOrder: stopLossOrderId , completedOrder: tradeCache?.completedOrder};
                                            trades.set(instrumentSymbol, tempTradeDetail);
                                            tradeLogger.info(`Current trade Detail: ${JSON.stringify(tempTradeDetail)}`);
                                        }
                                    }
                                }
                            }
                        }
                    } else {
                        tradeLogger.info(`${brokerClient.apiKey} has insufficient margin available to execute ${JSON.stringify(basketOrder)}`);
                    }
                }


                if (executionType === "update") {
                    const trade = trades.get(instrumentSymbol);
                    if (trade) {
                        const pendingOrderId = trade.pendingOrder;
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
                                            instrumentDetails.anchorPrice = average_price; // Added this price for re-entry if price goes above
                                        } else {
                                            tradeLogger.info(`PendingOrderId ${pendingOrderId} has been cancelled/rejected so invalidating it`);
                                            instrumentDetails.anchorPrice = undefined;
                                        }
                                        const tempTradeDetail = { pendingOrder: undefined , completedOrder: trade?.completedOrder};
                                        trades.set(instrumentSymbol, tempTradeDetail);
                                        instrumentDetails.status = POSITION_STATUS.NONE;
                                    } else {
                                        if (price > (instrumentDetails.anchorPrice ?? 0)) {
                                            // Place update order
                                            const stopLossPrice = this.getStopLossTriggerPrice(price);
                                            tradeLogger.info(`Updating stoploss order`);
                                            const isOrderUpdated = await kiteConnect.updateOrder(accessToken, "regular", pendingOrderId, { 
                                                price: stopLossPrice - 1,
                                                trigger_price: stopLossPrice
                                            });
                                            if (!(isOrderUpdated instanceof Error) && isOrderUpdated) {
                                                instrumentDetails.anchorPrice = price;
                                                instrumentDetails.status = POSITION_STATUS.HOLD;
                                            }
                                        } else {
                                            // Log cannot update order as price is less than anchor price.
                                            tradeLogger.info(`Curent price ${price} is less than last max price ${instrumentDetails.anchorPrice}. So not updating stoploss order`);
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






    private async clearOpenOrder(kiteConnect: KiteConnect, accessToken: string, trades: Map<string, TradeDetail> = new Map()) {
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
                    status === ORDER_STATUS.OPEN &&
                    product ===  Typings.ProductType.MIS
                ) {
                    const isOrderCancelled = await kiteConnect.cancelOrder(accessToken,"regular", order_id);
                    if (!(isOrderCancelled instanceof Error) && isOrderCancelled) {
                        tradeLogger.info(`${tradingsymbol} opened orders cancelled`);
                    }
                }
            }
        }
        return trades;
    }

    protected getStopLossTriggerPrice(price: number): number {
        const stopLossPrice = Math.min((price * this.STOPLOSS_PERCENT), this.MAX_STOPLOSS_PRICE);
        const triggerPrice = Math.floor(price - stopLossPrice);
        return triggerPrice;
    };

    abstract watchAndExecute (instrumentData: InstrumentTA): void;

}