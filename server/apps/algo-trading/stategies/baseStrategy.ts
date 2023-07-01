import { BOOLEAN, ORDER_STATUS, TRADE_STATUS } from "../../../../libs/typings";
import Subscription from "../../../entities/Subscription";
import KiteConnect from "../core/kite-connect";
import * as Typings from '../../../typings';
import TransactionController from "../controllers/transactionController";
import logger from "../logger";
import Transaction from "../../../entities/Transaction";

export default abstract class BaseStrategy {

    private kiteConnect: KiteConnect;
    private accessToken: string;
    private subscription: Subscription;
    private tradeController: TransactionController;
    constructor(kiteConnect: KiteConnect, accessToken: string, subscription: Subscription) {
        this.kiteConnect = kiteConnect;
        this.accessToken = accessToken;
        this.subscription = subscription;
        this.tradeController = new TransactionController();
    }
    abstract process(signal: Typings.Signal): void;
    protected async placeOrder(tradeStatus: TRADE_STATUS, basketId: string, orders: Typings.BasketOrderItem[]) {
        for (const order of orders) {
            if (this.subscription.testMode === BOOLEAN.TRUE) {
                const order_id = `${Math.ceil(Math.random() * Math.pow(10, 15))}`;
                if (tradeStatus === TRADE_STATUS.ENTRY) {
                    this.tradeController.save(order_id, basketId, this.getSubscription(), order);
                } else {
                    // TODO: Update transaction( to code during market hours)
                }
            }
            else {
                const order_id = await this.kiteConnect.placeOrder(this.accessToken, "regular", order);
                if (!(order_id instanceof Error)) {
                    if (tradeStatus === TRADE_STATUS.ENTRY) {
                        this.tradeController.save(order_id, basketId, this.getSubscription(), order);
                        this.pollAndUpdateOrderStatus(order_id);
                    } else {
                        // TODO: Update transaction( to code during market hours)
                    }

                }
            }
        }
    }

    protected async getActiveOrders() {
        const activeCompletedTranscations = await this.tradeController.getActiveTransactions(this.subscription);
        const activeTransactions: Transaction[] = [];
        for (const transaction of activeCompletedTranscations) {
            const orderDetail = await this.kiteConnect.getOrderStatus(this.accessToken, transaction.orderId);
            if (!(orderDetail instanceof Error)) {
                if (orderDetail?.data && orderDetail?.data instanceof Array) {
                    const resultLength = orderDetail.data.length;
                    if (resultLength > 0) {
                        const latestState = orderDetail.data[resultLength - 1];
                        // Check if order lastest state is in sink with local database
                        if (latestState.status === transaction.orderStatus) {
                            activeTransactions.push(transaction);
                        }
                    }
                }
            }
        }
        return activeTransactions;
    }

    protected getKiteConnect() {
        return this.kiteConnect;
    }

    protected getKiteConnectAccessToken() {
        return this.accessToken;
    }

    protected getSubscription() {
        return this.subscription;
    }

    private pollAndUpdateOrderStatus(orderId: string) {
        const intervalTimer = setInterval(async () => {
            const result = await this.kiteConnect.getOrderStatus(this.accessToken, orderId);
            logger.info(`Polling order status. Order Id: ${orderId}`);
            if (result instanceof Error) {
                /**
                 * Wrost case
                 * TODO:
                 *  1. Notify user to check manually order status and exit all trades.
                 *  2. Pause all the alerts from TradingView until this is resovled.
                 */
                clearInterval(intervalTimer);
            } else if (result?.data && result?.data instanceof Array) {
                const resultLength = result.data.length;
                if (resultLength > 0) {
                    const latestState = result.data[resultLength - 1];
                    /**
                     * CANCELLED: Only when user/algo cancel the trade.
                     * REJECTED: Only when margin requirement is not fulfilled.
                     * COMPLETED: Fulfilled
                     *
                     * CANCELLED or REJECTED is not possible in our trade because we haven't triggered cancel order and margin is checked before
                     * placing order. The expectation is hedge order will be compelted first at MRK order in current/next weekly expiry which is
                     * highly liquid so we don't expected REJECTED for margin required.
                     */
                    const closedState = [ORDER_STATUS.CANCELLED, ORDER_STATUS.COMPLETE, ORDER_STATUS.REJECTED];
                    if (latestState?.status && closedState.includes(latestState.status)) {
                        // Update in the database
                        logger.info(`Updating order status. ${JSON.stringify(latestState)}`);
                        this.tradeController.update(orderId, latestState);
                        clearInterval(intervalTimer);
                    }
                }
            }
        }, 1000);
    }
}