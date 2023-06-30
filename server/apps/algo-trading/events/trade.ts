import EventEmitter from 'events';
import * as Typings from '../../../typings';
import TradeController from '../controllers/tradeController';


const TradeEvent = new EventEmitter();

TradeEvent.on('tradeExecutor', tradeProcessor);

function tradeProcessor(inputs: string): void {
    const payload = JSON.parse(inputs) as Record<string, any>[];
    const tradeController = new TradeController();
    tradeController.executeOrder(payload as Typings.Signal[]);
}

export default TradeEvent;