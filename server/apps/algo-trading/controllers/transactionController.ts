import TransactionModel from "../models/transactionModel";
import * as Typings from '../../../typings';
import Subscription from "../../../entities/Subscription";
export default class TransactionController {
    private transactionModel: TransactionModel;

    constructor() {
        this.transactionModel = new TransactionModel();
    }

    save(orderId: string, transactionId: string, subscription: Subscription, order: Typings.BasketOrderItem) {
        return this.transactionModel.save(orderId, transactionId, subscription, order);
    }

    update(orderId: string, orderDetail: Record<string, any>) {
        this.transactionModel.update(orderId, orderDetail);
    }

    async getActiveTransactions(subscription: Subscription) {
        return this.transactionModel.activeTransactions(subscription);
    }
}