import { InstrumentTA } from '../../../libs/typings';
import OptionBuyerStrategy from './stategies/optionBuyerStrategy';

let optionBuyerStrategy: OptionBuyerStrategy;

export default function priceWatcher(subscribedTick: InstrumentTA) {
    if (!optionBuyerStrategy) {
        optionBuyerStrategy = new OptionBuyerStrategy();
    }
    optionBuyerStrategy.watch(subscribedTick);
}

