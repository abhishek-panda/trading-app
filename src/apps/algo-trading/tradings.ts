import EventEmitter from 'events';
import * as Utils from './utils';
import * as Kite from './kite';
import * as Typings from './typings';
import * as Strategies from './stategies'
import logger from './logger';

const TradeEvent = new EventEmitter();

export  { TradeEvent };

TradeEvent.on('tradeExecutor', TradeProcessor);

function TradeProcessor (inputs: string): void {
    const payload = JSON.parse(inputs) as Record<string, any>;
    if (payload.ticker !== '' && payload.signalType !== '' &&  payload.title !== '' && payload.timeFrame !== '') {
        executeOrder(payload as Typings.Signal);
    }
}


async function executeOrder(signal: Typings.Signal): Promise<void> {
    const tickerName = Utils.TICKER[signal.ticker];
    if (process.env.ACCESS_TOKEN && tickerName !== undefined) {
        const currentTicker = `${Typings.Exchange.NSE}:${tickerName}`; // "NSE:NIFTY 50"
        const currentTickerQuote = await Kite.getQuote([currentTicker]);
        if (!(currentTickerQuote instanceof Error) && currentTickerQuote[currentTicker]) {
            const currentTickerLastPrice = currentTickerQuote[currentTicker].last_price ?? 0;
            if (currentTickerLastPrice > 0) {
                const strategyOrder = await Strategies.followTrendStrategy(signal, currentTickerLastPrice);
                if (strategyOrder) {
                    const orderPromises: Promise<string>[] = [];
                    strategyOrder.orders.forEach(order => {
                        const orderPromise = Kite.placeOrder("regular", order);
                        orderPromises.push(orderPromise);
                    });
                    Promise.all(orderPromises).then(orderIds => {
                        const stringifiedOrderIds =  orderIds.join(',');
                        logger.info(`${strategyOrder.transaction} orders Placed : ${stringifiedOrderIds}`)
                    }).catch(err => {
                        console.log(err);
                    })
                }
            }
        }
    }
}

