import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import StrategyLeg from "../../../entities/StrategyLeg";
import { STRATEGY, InstrumentTA } from "../../../../libs/typings";
import BrokerClient from "../../../entities/BrokerClient";
import ControlPanelModel from "../../trading-app/models/controlPanelModel";
import SubscriptionModel from "../../trading-app/models/subscriptionModel";
import KiteConnect from "../core/kite-connect";
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

export default abstract class BaseStrategy {
    private dataSource: DataSource;
    private tradeStartTime: number;
    private tradeCloseTime: number;
    protected subscribedInstruments: Map<number, StrategyLegDetail> = new Map();
    private stopLossPercent: number;
    protected brokerClients: BrokerClient[] = []; // Note: Make sure all the clients are active before starting algo

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
                this.brokerClients.push(client);
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

    protected abstract getStopLossTriggerPrice(price: number): number;

    abstract watchAndExecute (instrumentData: InstrumentTA): void;

}