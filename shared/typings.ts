export interface User {
	id: string;
	name: string;
	email: string;
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


export enum UserRole {
	ADMIN = 'admin',
	USER = 'user',
}


export enum BOOLEAN {
    TRUE='true',
    FALSE='false'
}


export enum BROKER {
	ZERODHA = "zerodha"
}
export interface BrokenClientRegistation {
	cname: string;
	broker: BROKER;
	apiKey: string;
}

export interface BrokerClient {
    id: string;
    cname: string;
	apiKey: string;
	broker: BROKER;
    isActive: BOOLEAN;
}