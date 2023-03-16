"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_router_dom_1 = require("react-router-dom");
var Home_1 = __importDefault(require("./pages/Home"));
var _404_1 = __importDefault(require("./pages/404"));
var AppRouter = function () {
    return (<react_router_dom_1.BrowserRouter>
			<react_router_dom_1.Routes>
				<react_router_dom_1.Route path="/" element={<Home_1.default />}/>
				<react_router_dom_1.Route path="*" element={<_404_1.default />}/>
			</react_router_dom_1.Routes>
		</react_router_dom_1.BrowserRouter>);
};
exports.default = AppRouter;
