import * as Typings from '../../../typings';
import { DataSource } from 'typeorm';
import DBConn from '../../../dbConn';
import Transaction from '../../../entities/Transaction';
import Subscription from '../../../entities/Subscription';
import { BOOLEAN, ORDER_STATUS } from '../../../../libs/typings';


export default class TransactionModel {
    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async save(orderId: string, transactionId: string, subscription: Subscription, order: Typings.BasketOrderItem) {
        const transaction = new Transaction(
            orderId,
            subscription,
            transactionId,
            order.tradingsymbol,
            order.transaction_type,
            order.quantity,
            order.price,
            subscription.testMode
        );
        const result = await this.dataSource.getRepository(Transaction).save(transaction);
        return result;
    }

    async update(orderId: string, orderDetail: Record<string, any>) {
        const {
            status = ORDER_STATUS.OPEN,
            average_price = 0,
        } = orderDetail;
        const result = await this.dataSource.getRepository(Transaction).update({ orderId }, { orderStatus: status, entryprice: average_price });
        return result;
    }

    async activeTransactions(subscription: Subscription): Promise<Transaction[]> {
        const activeTransaction: Transaction[] = await this.dataSource
            .createQueryBuilder()
            .select(["orderId", "ticker", "transactionType", "quantity"])
            .from(Transaction, "transaction")
            .where("transaction.isActive = :isActive")
            .andWhere("transaction.brokerClientId = :brokerClientId")
            .andWhere("transaction.strategyId = :strategyId")
            .andWhere("transaction.timeframe = :timeframe")
            .setParameters({
                isActive: BOOLEAN.TRUE,
                brokerClientId: subscription.brokerClientId,
                strategyId: subscription.strategyId,
                timeframe: subscription.timeframe
            })
            .getRawMany();
        return activeTransaction;
    }



}