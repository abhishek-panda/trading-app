import * as Typings from '../../../typings';
import { DataSource } from 'typeorm';
import DBConn from '../../../dbConn';
import Transaction from '../../../entities/Transaction';
import Subscription from '../../../entities/Subscription';


export default class TransactionModel {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async save(transactionId: string, subscription: Subscription, order: Typings.BasketOrderItem, orderId: string  ) {
        const transaction = new Transaction(
            transactionId,
            subscription,
            orderId,
            order.tradingsymbol,
            order.transaction_type,
            order.quantity,
            order.price,
            subscription.testMode
        );
        const result = await this.dataSource.getRepository(Transaction).save(transaction);
        return result;
    }
}