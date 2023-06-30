import TradeModel from "../models/tradeModel";
import * as Typings from '../../../typings';

export default class TradeController {
    private tradeModel: TradeModel;

    constructor() {
        this.tradeModel = new TradeModel();
    }

    executeOrder(signals: Typings.Signal[]) {
        this.tradeModel.executeOrder(signals);
    }
}