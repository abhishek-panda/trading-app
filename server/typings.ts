import { IBrokerClient, TradingTimeFrame } from "../libs/typings";

export enum WEEKDAYS {
    SUNDAY = 0,
    MONDAY = 1,
    TUESDAY = 2,
    WEDNESDAY = 3,
    THRUSDAY = 4,
    FRIDAY = 5,
    SATURDAY = 6
}

export enum OPTION {
    CE = 'CE',
    PE = 'PE'
}

export enum Exchange {
    NSE = 'NSE',
    NFO = 'NFO',
    // CDS = 'CDS',
    // MCX = 'MCX'
}

export enum TransactionType {
    BUY = "BUY",
    SELL = "SELL",
}

export enum ProductType {
    MIS = "MIS",
    CNC = "CNC",
    NRML = "NRML",
}

export enum OderType {
    MARKET = 'MARKET',
    LIMIT = 'LIMIT',
    SL = 'SL',
    SLM = 'SL-M'
}

export enum ExpiryType {
    MONTHLY = 'MONTHLY',
    WEEKLY = 'WEEKLY'
}

export enum SignalType {
    sellenter = "sellenter",
    sellexit = "sellexit",
    buyenter = "buyenter",
    buyexit = "buyexit"
}

/**
 * Interfaces
 */

export interface MonthlyContract {
    ticker: string;
    expiresOn: Date;
    daysLeft: number;
}

export interface Signal {
    id: string;
    signalType: SignalType;
    ticker: string;
    timeFrame: TradingTimeFrame;
}

export interface TargetPrice {
    position: number;
    hedge: number;
}

export interface BasketOrderItem {
    exchange: Exchange;
    tradingsymbol: string;
    transaction_type: TransactionType;
    variety: "regular";
    product: ProductType;
    order_type: OderType;
    quantity: number;
    price: number;
    trigger_price: number;
    order_id?: string;
}

export interface StrategyOrder {
    ticker: string;
    id: string;
    transaction: TransactionType,
    orders: BasketOrderItem[],
    timeFrame: TradingTimeFrame;
}


export interface OrdersTable {
    BUY: string[];
    SELL: string[];
    ONHOLD: string[];
}


export enum ENV_OPERATION {
    ADD_REPLACE = 'ADD_REPLACE',
    REMOVE = 'REMOVE'
}

export interface SBrokerClient extends IBrokerClient {
    accessToken: string;
}
