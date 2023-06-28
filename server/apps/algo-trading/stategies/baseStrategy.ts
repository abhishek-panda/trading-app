import { BOOLEAN, TRADE_STATUS } from "../../../../libs/typings";
import Subscription from "../../../entities/Subscription";
import KiteConnect from "../core/kite-connect";
import * as Typings from '../../../typings';
import TransactionController from "../controllers/transactionController";
import { cache } from "../../../utils";

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
                        const transactionData = {
                            basketId,
                            subscription: this.subscription,
                            order,
                            orderId: order_id
                        };
                        this.tradeController.save(order_id, basketId, this.getSubscription(), order);
                        cache.set(`OID_${order_id}`, transactionData);
                    } else {
                        // TODO: Update transaction( to code during market hours)
                    }

                }
            }
        }
    }

    protected getActiveOrders() {
        return this.tradeController.getActiveTransactions(this.subscription);
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
}