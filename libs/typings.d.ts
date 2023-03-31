export interface User {
    name: string;
    email: string;
}
export interface UserRegistrationInputs {
    uname: string;
    email: string;
    password: string;
}
export interface IResponse {
    data?: any;
    message?: string;
    error?: Record<string, string>;
}
