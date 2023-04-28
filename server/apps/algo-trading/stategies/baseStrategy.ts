import { BOOLEAN } from "../../../../libs/typings";
import Subscription from "../../../entities/Subscription";
import KiteConnect from "../core/kite-connect";
import * as Typings from '../../../typings';

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
    protected execute(order:  Typings.BasketOrderItem) {
        if (this.subscription.testMode === BOOLEAN.TRUE) {
            return new Promise((resolve, _) => {
                const order_id = Math.ceil(Math.random() * Math.pow(10,15));
                resolve(order_id);
            });
        }
        return this.kiteConnect.placeOrder(this.accessToken, "regular", order);
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