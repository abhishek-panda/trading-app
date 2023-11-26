import { InstrumentTA, STRATEGY } from '../../../libs/typings';
import DirectionalStrategy from './stategies/directionalStrategy';

let optionBuyerStrategy: DirectionalStrategy;
let optionSellerStrategy: DirectionalStrategy;

export default function priceWatcher(subscribedTick: InstrumentTA) {
    if (!optionBuyerStrategy) {
        optionBuyerStrategy = new DirectionalStrategy(STRATEGY.OPTION_BUYER);
    }
    optionBuyerStrategy.watchAndExecute(subscribedTick);

    if (!optionSellerStrategy) {
        optionSellerStrategy = new DirectionalStrategy(STRATEGY.OPTION_SELLER);
    }
    optionSellerStrategy.watchAndExecute(subscribedTick);
}

