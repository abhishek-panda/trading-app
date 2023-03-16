"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
require("./style.css");
var Error404 = function () {
    return (<div className='error404'>
			<h1>404 Page Not Found</h1>
			<section className="error404__section">
				<span>
					<span>4</span>
				</span>
				<span>0</span>
				<span>
					<span>4</span>
				</span>
			</section>
			<div className="error404__message">Maybe this page moved? Got deleted? Is hiding out in quarantine? Never existed in the first place?
				<p>Let's go <a href="/">home</a> and try from there.</p>
			</div>
		</div>);
};
exports.default = Error404;
