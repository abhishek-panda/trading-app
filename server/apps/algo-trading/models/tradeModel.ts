import { DataSource } from 'typeorm';
import DBConn from '../../../dbConn';
import * as Typings from '../typings';
import * as Utils from '../utils';
import * as Yup from 'yup';
import logger from '../logger';
import KiteConnect from '../core/kite-connect';
import { BOOLEAN, TradingTimeFrame } from '../../../../libs/typings';
import { validStrategyId } from '../../../../libs/utils';
import Subscription from '../../../entities/Subscription';
import BrokerClient from '../../../entities/BrokerClient';



export default class TradeModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async executeOrder(signal: Typings.Signal) {
        /**
         * 1. Validate input
         * 2. Check existance in DB.
         * 3. Save trade
         * 4. Update trade entry
         */

        const tickerName = Utils.TICKER[signal.ticker];
        const validSignalType = await Yup.mixed().oneOf(Object.values(Typings.SignalType)).isValid(signal.signalType);
        const validTimeframe = await Yup.string().oneOf(Object.values(TradingTimeFrame)).isValid(signal.timeFrame);
        const validStrategy = await Yup.string().matches(validStrategyId).isValid(signal.id as string ?? "");

        if (tickerName && validSignalType && validTimeframe && validStrategy) {
            const brokerClientDetails =  await this.dataSource
                .getRepository(BrokerClient)
                .createQueryBuilder("brokerClient")
                .innerJoinAndSelect(
                    "brokerClient.subscription",
                    "subscription",
                    "subscription.isActive = :isActive",
                    { isActive: BOOLEAN.TRUE }
                )
                .where("brokerClient.isEnabled = :isEnabled")
                .setParameters({
                    isEnabled:  BOOLEAN.TRUE
                })
                .getMany();

            if (brokerClientDetails.length > 0) {
                brokerClientDetails.forEach(client => {
                    console.log(client.subscription);
                })
            }
        }
        // const tickerName = Utils.TICKER[signal.ticker];
        // if (process.env.ACCESS_TOKEN && tickerName !== undefined) {
        //     const currentTicker = `${Typings.Exchange.NSE}:${tickerName}`; // "NSE:NIFTY 50"
        //     const currentTickerQuote = await Kite.getQuote([currentTicker]);
        //     if (!(currentTickerQuote instanceof Error) && currentTickerQuote[currentTicker]) {
        //         const currentTickerLastPrice = currentTickerQuote[currentTicker].last_price ?? 0;
        //         if (currentTickerLastPrice > 0) {
        //             const strategyOrder = await Strategies.followTrendStrategy(signal, currentTickerLastPrice);
        //             if (strategyOrder) {
        //                 const orderPromises: Promise<string>[] = [];
        //                 strategyOrder.orders.forEach(order => {
        //                     const orderPromise = Kite.placeOrder("regular", order);
        //                     orderPromises.push(orderPromise);
        //                 });
        //                 Promise.all(orderPromises).then(orderIds => {
        //                     const stringifiedOrderIds =  orderIds.join(',');
        //                     logger.info(`${strategyOrder.transaction} orders Placed : ${stringifiedOrderIds}`)
        //                 }).catch(err => {
        //                     console.log(err);
        //                 })
        //             }
        //         }
        //     }
        // }
    }
}
