
/**
 * Enums
 */

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



/**
 * Interfaces
 */

export interface MonthlyContract {
    ticker: string;
    expiresOn: Date;
    daysLeft: number;
}

export enum TradingTimeFrame {
    "1MIN" = "1",
    "3MIN" = "3",
    "5MIN" = "5",
    "15MIN" = "15",
    "30MIN" = "30",
    "45MIN" = "45",
    "1H" = "60",
    "2H" = "120",
    "3H" = "180",
    "4H" = "240",
    "1D" = "D",
    "1W" = "W"
}

export interface Signal {
    title: string;
    signalType: string;
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
}

export interface StrategyOrder {
    ticker: string;
    title: string;
    transaction: TransactionType,
    orders: BasketOrderItem[],
    timeFrame: TradingTimeFrame;
}


export interface OrdersTable {
    BUY: string[];
    SELL: string[];
    ONHOLD: string[];
}