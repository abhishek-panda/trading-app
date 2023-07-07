import BaseStrategy from "./baseStrategy";
import TrendTradingStrategy from "./trendTradingStrategy";
import KiteConnect from '../core/kite-connect';
import Subscription from "../../../entities/Subscription";
import SnipperTradingStrategy from "./snipperTradingStrategy";


function strategyResolver(kiteConnect: KiteConnect, accessToken: string, subscription: Subscription): BaseStrategy | null {
       switch (subscription.strategyId) {
              case "TREND_TRADE":
                     return new TrendTradingStrategy(kiteConnect, accessToken, subscription);
              case "SNIPPER_TRADE":
                     return new SnipperTradingStrategy(kiteConnect, accessToken, subscription);
              default:
                     return null;
       }
}

export default strategyResolver;