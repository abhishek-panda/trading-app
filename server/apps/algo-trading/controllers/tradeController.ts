import TradeModel from "../models/tradeModel";
import * as Typings from '../typings';

export default class TradeController {
    private tradeModel: TradeModel;

    constructor() {
        this.tradeModel = new TradeModel();
    }

    executeOrder(signal: Typings.Signal) {
        this.tradeModel.executeOrder(signal);
    }
}