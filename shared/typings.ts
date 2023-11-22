export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
}

export interface UserRegistrationInputs {
	uname: string;
	email: string;
	password: string;
}

export interface UserLoginInputs {
	email: string;
	password: string;
}

export interface IResponse {
	data?: any;
	message?: string;
	error?: Record<string, string>
}

export enum TRADE_STATUS {
	ENTRY = "ENTRY",
	EXIT = "EXIT"
}

export enum UserRole {
	ADMIN = 'admin',
	USER = 'user',
}


export enum BOOLEAN {
	TRUE = 'true',
	FALSE = 'false'
}

export enum ORDER_STATUS {
	OPEN = "OPEN",
	COMPLETE = "COMPLETE",
	CANCELLED = "CANCELLED",
	REJECTED = "REJECTED",
	TRIGGER_PENDING = "TRIGGER PENDING"
}


export enum BROKER {
	ZERODHA = "zerodha"
}
export interface BrokenClientRegistation {
	cname: string;
	broker: string;
	apiKey: string;
	secret: string;
}

export interface IBrokerClient {
	id: string;
	cname: string;
	apiKey: string;
	broker: BROKER;
	isEnabled: BOOLEAN;
	isActive: BOOLEAN;
}

export interface IValidateClient {
	action: "login";
	cid: string;
	request_token: string;
	status: "success";
	type: "login"
}

export interface IStrategy {
	sid: string;
	name: string;
	description: string;
	timeframe: string;
	callInstrumentName: string;
    putInstrumentName: string;
}

export interface ISubscription {
	name: string;
	brokerClientId: string;
	strategyId: string;
}

export interface ISubscriptionData extends ISubscription {
	brokerClientName: string;
	strategyName: string;
	testMode: BOOLEAN;
	isActive: BOOLEAN;
}

export enum TradingTimeFrame {
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

export interface IOHLC {
    "open": number;
    "high": number;
    "low": number;
    "close": number;
    "ema5": number;
    "ema9": number;
    "ema20": number;
	"ema50"?: number;
    "timestamp": string;
}


export interface InstrumentTA {
	"instrument": number;
	"timeframe": TradingTimeFrame;
	"candles": IOHLC[];
}


export enum STRATEGY {
    OPTION_BUYER = 'OPTION_BUYER',
	OPTION_SELLER = 'OPTION_SELLER',
}