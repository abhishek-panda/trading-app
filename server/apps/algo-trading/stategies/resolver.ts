import BaseStrategy from "./baseStrategy";
import UltraTradingStrategy from "./ultraTradingStrategy";
import KiteConnect from '../core/kite-connect';
import Subscription from "../../../entities/Subscription";


function strategyResolver(kiteConnect: KiteConnect, accessToken: string, subscription: Subscription): BaseStrategy | null {
       switch (subscription.strategyId) {
              case "ULTRA_TRADE":
                     return new UltraTradingStrategy(kiteConnect, accessToken, subscription);
              default:
                     return null;
       }
}

export default strategyResolver;