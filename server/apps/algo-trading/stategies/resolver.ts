import BaseStrategy from "./baseStrategy";
import CrossoverStrategy from "./intradayStrategy";
import KiteConnect from '../core/kite-connect';


function strategyResolver( kiteConnect: KiteConnect, accessToken: string, strategyId: string): BaseStrategy | null {
       switch (strategyId) {
              case "ICTS":
                     return new CrossoverStrategy(kiteConnect, accessToken);
              default:
                     return null;
       }
}

export default strategyResolver;