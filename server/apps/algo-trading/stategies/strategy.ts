import StrategyLeg from "../../../entities/StrategyLeg";
import { STRATEGY, InstrumentTA, ORDER_STATUS } from "../../../../libs/typings";
import BrokerClient from "../../../entities/BrokerClient";
import ControlPanelModel from "../../trading-app/models/controlPanelModel";
import SubscriptionModel from "../../trading-app/models/subscriptionModel";
import KiteConnect from "../core/kite-connect";
import * as Typings from '../../../typings';
import logger, {wsTickLogger} from "../logger";


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
    pending : string | undefined,
    completed: string | undefined,
}


interface ClientDetail {
    brokerClient: BrokerClient;
    kiteConnect: KiteConnect;
    trades: Record<string, TradeDetail>;// instrumentName(without NFO) ,  order_id | undefined to check order status if opened cancel order 
}

export default abstract class BaseStrategy {
    private tradeStartTime: number;
    private tradeCloseTime: number;
    protected subscribedInstruments: Map<number, StrategyLegDetail> = new Map();
    protected readonly STOPLOSS_PERCENT: number = 0.09; // 9%
    protected readonly MAX_STOPLOSS_PRICE = 15;
    // Note: Make sure all the clients are active before starting algo
    protected clientDetails: ClientDetail[] = [];

    constructor() {
        this.tradeStartTime = parseInt((process.env.TRADE_START_HR ?? '') + (process.env.TRADE_START_MIN ?? ''));
        this.tradeCloseTime = parseInt((process.env.TRADE_CLOSE_HR ?? '') + (process.env.TRADE_CLOSE_MIN ?? ''));
    }

    protected async init(strategyType: STRATEGY) {
        
        const subscribedInstruments = await (new ControlPanelModel()).getStrategyLegs(strategyType);
        // Preprocessing
        if (subscribedInstruments.length) {
            this.subscribedInstruments = subscribedInstruments.reduce((accumulator, leg) => {
                const id = parseInt(leg.instrumentId);
                accumulator.set(id, {status: POSITION_STATUS.NONE, strategyLeg:leg, anchorPrice: undefined});
                return accumulator;
            }, this.subscribedInstruments);
        }

        const brokerClients = await (new SubscriptionModel()).getBrokerClients(strategyType);

        for (let count = 0; count < brokerClients.length; count++) {
            const client = brokerClients[count];
            const kiteConnect = new KiteConnect(client.apiKey);
            const profile = await kiteConnect.getProfile(client.accessToken);
            if ((profile instanceof Error)) {
                wsTickLogger.info(`Client: ${client.apiKey} is not active`);
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

    async placeOrder(tradingsymbol: string, transaction_type: Typings.TransactionType, price: number, executionType: ExecutionType, isStopLossOrder: boolean = false) {
        const instrumentSymbol = tradingsymbol.split(":")[1];
        for(let client of this.clientDetails) {
            const {kiteConnect, brokerClient, trades} = client;
            const { accessToken } = brokerClient;
            if (executionType === "enter") {
                const quantity = 1;
                const lotSize = 50;
                const tradeOrder: Typings.BasketOrderItem = {
                    exchange: Typings.Exchange.NFO,
                    tradingsymbol: instrumentSymbol,
                    transaction_type: transaction_type,
                    variety: "regular",
                    product: Typings.ProductType.MIS,
                    order_type: isStopLossOrder ? Typings.OderType.SL : Typings.OderType.MARKET,
                    quantity: lotSize * quantity,
                    price: price - 1,
                    trigger_price: price,
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
                     * current and next weekly contract which are highly liquild, so its not required. But their is a change of 
                     * Freak trade and Slippage
                    */
                    for (const order of basketOrder) {
                        // First check if there are any existing order either pending of fullfiled
                        await this.clearOpenOrder(kiteConnect, accessToken, trades);
                        const newOrderId = await kiteConnect.placeOrder(accessToken, "regular", order);
                        if (!(newOrderId instanceof Error)) {
                            trades[instrumentSymbol] = {
                                pending: newOrderId,
                                completed: undefined
                            };
                        }
                    }
                } else {
                    wsTickLogger.info(`Trade: ${brokerClient.apiKey} has insufficient margin available to execute ${JSON.stringify(basketOrder)}`);
                }
            } else if (executionType === "update") {

                const pendingOrderId = trades[instrumentSymbol]?.pending;
                if (pendingOrderId) {
                    const orderDetailStatus = await kiteConnect.getOrderStatus(accessToken, pendingOrderId);
                    if (!(orderDetailStatus instanceof Error)) {
                        if (orderDetailStatus?.status === ORDER_STATUS.OPEN) {
                            await kiteConnect.updateOrder(accessToken, "regular", pendingOrderId, { 
                                price: price - 1,
                                trigger_price: price
                            });
                        }
                    }
                }
                
            } else if (executionType === "exit") {
                await this.clearOpenOrder(kiteConnect, accessToken, trades);
                const completedOrderId = trades[instrumentSymbol]?.completed;
                if (completedOrderId) {
                    const orderDetailStatus = await kiteConnect.getOrderStatus(accessToken, completedOrderId);
                    if (!(orderDetailStatus instanceof Error)) {
                        if (orderDetailStatus?.status === ORDER_STATUS.COMPLETE) {
                            const tradeOrder: Typings.BasketOrderItem = {
                                exchange: Typings.Exchange.NFO,
                                tradingsymbol: instrumentSymbol,
                                transaction_type: transaction_type,
                                variety: "regular",
                                product: Typings.ProductType.MIS,
                                order_type: Typings.OderType.MARKET,
                                quantity: orderDetailStatus.quantity,
                                price: Math.ceil(price),
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
                                for (const order of basketOrder) {
                                    const newOrderId = await kiteConnect.placeOrder(accessToken, "regular", order);
                                    if (!(newOrderId instanceof Error)) {
                                        trades[instrumentSymbol] = {
                                            pending: undefined,
                                            completed: undefined
                                        };
                                    }
                                }
                            }
                           
                        }
                    }
                }
            }
        }
    }


    private async clearOpenOrder(kiteConnect: KiteConnect, accessToken: string, trades: Record<string, TradeDetail> = {}) {
        const allOrders = await kiteConnect.getOrders(accessToken);
        if (!(allOrders instanceof Error) && allOrders.length > 0) {
            // Get all orders
            for(const order of allOrders) {
               
                const {instrument_token, status, product, order_id, tradingsymbol } = order;

                // Updating state of order
                if (trades[tradingsymbol]) {
                    const { pending } = trades[tradingsymbol];
                    if (pending === order_id && status === ORDER_STATUS.COMPLETE) {
                        trades[tradingsymbol].completed = order_id;
                        trades[tradingsymbol].pending = undefined; 
                    }
                }

                if (
                    this.subscribedInstruments.get(instrument_token) &&
                    status === ORDER_STATUS.OPEN &&
                    product ===  Typings.ProductType.MIS
                ) {
                    const isOrderCancelled = await kiteConnect.cancelOrder(accessToken,"regular", order_id);
                    if (isOrderCancelled) {
                        wsTickLogger.info(`Trade: ${tradingsymbol} opened orders cancelled`);
                    }
                }
            }
        }
        return trades;
    }

    protected abstract getStopLossTriggerPrice(price: number): number;

    abstract watchAndExecute (instrumentData: InstrumentTA): void;

}