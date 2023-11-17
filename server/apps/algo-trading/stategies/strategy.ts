import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
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
    HOLD = "HOLD"
}

interface StrategyLegDetail {
    status: POSITION_STATUS,
    strategyLeg: StrategyLeg,
    anchorPrice: number | undefined;
}

interface ClientDetail {
    brokerClient: BrokerClient;
    kiteConnect: KiteConnect;
    trades: Record<string, number>;
}

export default abstract class BaseStrategy {
    private dataSource: DataSource;
    private tradeStartTime: number;
    private tradeCloseTime: number;
    protected subscribedInstruments: Map<number, StrategyLegDetail> = new Map();
    private stopLossPercent: number;
    // Note: Make sure all the clients are active before starting algo
    protected clientDetails: ClientDetail[] = [];

    constructor() {
        this.stopLossPercent = 0.09; // 9% 
        this.dataSource = DBConn.getInstance();
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
                let trades = await this.clearOpenOrders(kiteConnect, client);
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

    protected getStopLossPercentage() {
        return this.stopLossPercent;
    }

    async placeOrder(tradingsymbol: string, transaction_type: Typings.TransactionType, price: number) {
        const quantity = 5;
        const lotSize = 50;
        const tradeOrder: Typings.BasketOrderItem = {
            exchange: Typings.Exchange.NFO,
            tradingsymbol: tradingsymbol,
            transaction_type: transaction_type,
            variety: "regular",
            product: Typings.ProductType.MIS,
            order_type: Typings.OderType.MARKET,
            quantity: lotSize * quantity,
            price: Math.ceil(price),
            trigger_price: 0,
        };

        const basketOrder = [tradeOrder];
        let userAvailableMargin = 0;
        let basketMarginRequired = 0;

        for (let client of this.clientDetails) {
            const {kiteConnect, brokerClient} = client;
            const { accessToken } = brokerClient;
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
                    const newOrderId = await kiteConnect.placeOrder(accessToken, "regular", tradeOrder);
                }
            } else {
                wsTickLogger.info(`Trade: ${brokerClient.apiKey} has insufficient margin available`);
            }
        }
    }


    private async clearOpenOrders(kiteConnect: KiteConnect, client: BrokerClient) {
        const allOrders = await kiteConnect.getOrders(client.accessToken);
        let trades = {};
        if (!(allOrders instanceof Error) && allOrders.length > 0) {
            // Get all pending orders
            for(const order of allOrders) {
                const {instrument_token, status, product, order_id, tradingsymbol } = order;
                if (
                    this.subscribedInstruments.get(instrument_token) &&
                    status === ORDER_STATUS.OPEN &&
                    product ===  Typings.ProductType.MIS
                ) {
                    const isOrderCancelled = await kiteConnect.cancelOrder(client.accessToken,"regular", order_id);
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