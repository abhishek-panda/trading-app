import { DataSource } from 'typeorm';
import DBConn from '../../../dbConn';
import * as Typings from '../../../typings';
import * as Utils from '../../../utils';
import * as Yup from 'yup';
import KiteConnect from '../core/kite-connect';
import { BOOLEAN, TradingTimeFrame } from '../../../../libs/typings';
import { validStrategyId } from '../../../../libs/utils';
import BrokerClient from '../../../entities/BrokerClient';
import strategyResolver from '../stategies/resolver';



export default class TradeModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async executeOrder(signal: Typings.Signal) {
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
                    "subscription.isActive = :isActive AND subscription.strategyId = :strategyId AND subscription.timeframe = :timeframe",
                    { isActive: BOOLEAN.TRUE,  strategyId: signal.id, timeframe: signal.timeFrame }
                )
                .where("brokerClient.isEnabled = :isEnabled")
                .setParameters({
                    isEnabled:  BOOLEAN.TRUE
                })
                .getMany();

            for (let count = 0; count < brokerClientDetails.length;  count++) {
                const client = brokerClientDetails[count];
                const kiteConnect = new KiteConnect(client.apiKey);
                const profile = await kiteConnect.getProfile(client.accessToken);
                if (!(profile instanceof Error)) {
                    const subscriptions = client.subscription;
                    subscriptions.forEach(subscription => {
                        const strategy  = strategyResolver(kiteConnect, client.accessToken, subscription);
                        strategy?.process(signal)
                    });
                }
            }
        }
    }
}
