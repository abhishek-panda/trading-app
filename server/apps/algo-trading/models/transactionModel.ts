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
        return result.orderId;
    }

    async update(orderId: string, orderDetail: Record<string, any>, oldOrderId?: string) {
        /**
         * If oldOrderId then assume exiting the current postion so update "isActive" to false as well,
         * else assume it's newer order
         */
        const validOrderId = oldOrderId ? oldOrderId : orderId;
        const {
            status = ORDER_STATUS.OPEN,
            average_price = 0,
        } = orderDetail;
        const updateValues: Record<string, any> = {
            orderStatus: status,
            entryprice: average_price
        };
        if ([ORDER_STATUS.CANCELLED, ORDER_STATUS.REJECTED].includes(orderDetail.status) || oldOrderId) {
            updateValues.isActive = false;
        }

        if (oldOrderId) {
            updateValues.exitprice = average_price;
        }

        const result = await this.dataSource.getRepository(Transaction).update({ orderId: validOrderId }, updateValues);
        return result;
    }

    async activeTransactions(subscription: Subscription): Promise<Transaction[]> {
        const activeTransaction: Transaction[] = await this.dataSource
            .createQueryBuilder()
            .select(["orderId", "ticker", "transactionType", "quantity", "orderStatus"])
            .from(Transaction, "transaction")
            .where("transaction.isActive = :isActive")
            .andWhere("transaction.brokerClientId = :brokerClientId")
            .andWhere("transaction.strategyId = :strategyId")
            .andWhere("transaction.timeframe = :timeframe")
            .andWhere("transaction.orderStatus = :orderStatus")
            .setParameters({
                isActive: BOOLEAN.TRUE,
                brokerClientId: subscription.brokerClientId,
                strategyId: subscription.strategyId,
                timeframe: subscription.timeframe,
                orderStatus: ORDER_STATUS.COMPLETE
            })
            .getRawMany();
        return activeTransaction;
    }



}