import * as Yup from "yup";
export declare const validUserName: RegExp;
export declare const validEmail: RegExp;
export declare const validPassword: RegExp;
export declare const validUserRegistrationSchema: Yup.ObjectSchema<{
    uname: string;
    email: string;
    password: string;
}, Yup.AnyObject, {
    uname: undefined;
    email: undefined;
    password: undefined;
}, "">;
