import BaseStrategy from "./baseStrategy";
import IntradayStrategy from "./intradayStrategy";
import KiteConnect from '../core/kite-connect';
import Subscription from "../../../entities/Subscription";


function strategyResolver( kiteConnect: KiteConnect, accessToken: string, subscription: Subscription): BaseStrategy | null {
       switch (subscription.strategyId) {
              case "ITCS":
                     return new IntradayStrategy(kiteConnect, accessToken, subscription);
              default:
                     return null;
       }
}

export default strategyResolver;