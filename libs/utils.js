"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validTokenSchema = exports.validUserRegistrationSchema = exports.validPassword = exports.validEmail = exports.validUserName = void 0;
var Yup = __importStar(require("yup"));
exports.validUserName = /^[A-Za-z ]{3,20}$/;
exports.validEmail = /^[a-zA-Z0-9._]+@[a-zA-Z0-9]+\.[a-zA-Z]{2,}$/;
exports.validPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/;
exports.validUserRegistrationSchema = Yup.object({
    uname: Yup.string()
        .required("Required")
        .matches(exports.validUserName, "Must contain minimum 3 chatacters and maximum upto 20 characters"),
    email: Yup.string()
        .required("Required")
        .matches(exports.validEmail, "Invalid Email"),
    password: Yup.string()
        .required("Required")
        .matches(exports.validPassword, "Must Contain 8 Characters, One Uppercase, One Lowercase, One Number and One Special Case Character"),
});
exports.validTokenSchema = Yup.string().matches(/^Bearer [a-zA-Z0-9]+$/);
