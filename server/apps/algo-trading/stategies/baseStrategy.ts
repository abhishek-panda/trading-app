import { BOOLEAN } from "../../../../libs/typings";
import Subscription from "../../../entities/Subscription";
import KiteConnect from "../core/kite-connect";
import * as Typings from '../../../typings';
import TransactionController from "../controllers/transactionController";
import { cache } from "../../../utils";

export default abstract class BaseStrategy {
    
    private kiteConnect: KiteConnect;
    private accessToken: string;
    private subscription: Subscription;
    constructor(kiteConnect: KiteConnect, accessToken: string, subscription: Subscription) {
        this.kiteConnect = kiteConnect;
        this.accessToken = accessToken;
        this.subscription = subscription;
    }
    abstract process(signal: Typings.Signal): void;
    protected async placeOrder(transactionId: string, order:  Typings.BasketOrderItem) {
        const tradeController = new TransactionController();
        if (this.subscription.testMode === BOOLEAN.TRUE) {
            const order_id = `${Math.ceil(Math.random() * Math.pow(10,15))}`;
            tradeController.save(transactionId, this.getSubscription(),  order, order_id);
        } else {
            const order_id = await this.kiteConnect.placeOrder(this.accessToken, "regular", order);
            const transactionData = {
                transactionId,
                subscription: this.subscription,
                order,
                orderId: order_id
            };
            cache.set(`OID_${order_id}`, transactionData);
        }  
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