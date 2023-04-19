import EventEmitter from 'events';
import * as Typings from '../typings';
import TradeModel from '../models/tradeModel';


const TradeEvent = new EventEmitter();

TradeEvent.on('tradeExecutor', tradeProcessor);

function tradeProcessor (inputs: string): void {
    const payload = JSON.parse(inputs) as Record<string, any>;
    if (payload.ticker !== '' && payload.signalType !== '' &&  payload.title !== '' && payload.timeFrame !== '') {
        const tradeModel = new TradeModel();
        tradeModel.executeOrder(payload as Typings.Signal);
    }
}

export default TradeEvent;