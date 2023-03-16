"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var client_1 = __importDefault(require("react-dom/client"));
var app_1 = __importDefault(require("./app"));
var container = document.getElementById('app-shell');
if (container) {
    var creatRoot = client_1.default.createRoot(container);
    creatRoot.render(<app_1.default />);
}
