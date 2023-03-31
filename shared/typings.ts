export interface User {
	name: string;
	email: string;
}

export interface UserRegistrationInputs {
	uname: string;
	email: string;
	password: string;
}

export interface StandardResponse {
	data?: any;
	message?: string;
    error?: Record<string, string>
}
export interface UserRegistrationResponse extends StandardResponse {
}