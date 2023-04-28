import TransactionModel from "../models/transactionModel";
import * as Typings from '../../../typings';
import Subscription from "../../../entities/Subscription";
export default class TransactionController {
    private transactionModel: TransactionModel;

    constructor() {
        this.transactionModel = new TransactionModel();
    }

    save(transactionId: string, subscription: Subscription, order: Typings.BasketOrderItem, orderId: string ) {
        this.transactionModel.save(transactionId, subscription, order, orderId );
    }
}