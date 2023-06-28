import BaseStrategy from "./baseStrategy";
import UltraIntradayStrategy from "./ultraIntradayStrategy";
import KiteConnect from '../core/kite-connect';
import Subscription from "../../../entities/Subscription";


function strategyResolver(kiteConnect: KiteConnect, accessToken: string, subscription: Subscription): BaseStrategy | null {
       switch (subscription.strategyId) {
              case "ULTRA_INTRA":
                     return new UltraIntradayStrategy(kiteConnect, accessToken, subscription);
              default:
                     return null;
       }
}

export default strategyResolver;