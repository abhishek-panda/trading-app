import KiteConnect from "../core/kite-connect";
import * as Typings from '../typings';

export default abstract class BaseStrategy {
    
    private kiteConnect: KiteConnect;
    private accessToken: string;
    constructor(kiteConnect: KiteConnect, accessToken: string) {
        this.kiteConnect = kiteConnect;
        this.accessToken = accessToken;
    }
    abstract process(signal: Typings.Signal): void;
    protected execute(order:  Typings.BasketOrderItem) {
        this.kiteConnect.placeOrder(this.accessToken, "regular", order);
    }

    protected getKiteConnect() {
        return this.kiteConnect;
    }

    protected getKiteConnectAccessToken() {
        return this.accessToken;
    }
}