import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { IResponse, IStrategy, ISubscription, TradingTimeFrame, ISubscriptionData } from "../../../../libs/typings";
import { validSubscriptionSchema } from "../../../../libs/utils";
import BrokerClient from "../../../entities/BrokerClient";
import Strategy from "../../../entities/Strategy";
import Subscription from "../../../entities/Subscription";
import { getLocalDateTime } from "../../../utils";

export default class SubscriptionModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async subscribe(inputData: Record<string, any>, userId: string) : Promise<IResponse> {
        try {
            const validSubscription = await validSubscriptionSchema.validate(inputData);
            // @ts-ignore
            const selectedTimeFrame = Object.keys(TradingTimeFrame).find(value => TradingTimeFrame[value] === validSubscription.timeframe);
            const clientExists = await this.dataSource.getRepository(BrokerClient).findOneBy({ id:  validSubscription.brokerClient, userId });
            const strategyExists = await this.dataSource.getRepository(Strategy).findOneBy({ sid: validSubscription.strategy });
            if (selectedTimeFrame && clientExists && strategyExists) {
                const subscriptionRepository = await this.dataSource.getRepository(Subscription);
                // check if subscription exists
                const subscriptionExists =  await subscriptionRepository.findOneBy({
                    brokerClientId: validSubscription.brokerClient,
                    strategyId:  validSubscription.strategy,
                    // @ts-ignore
                    interval: validSubscription.timeframe
                });
                if (!subscriptionExists) {
                    // @ts-ignore
                    const subscription = new Subscription(validSubscription.brokerClient, validSubscription.strategy, TradingTimeFrame[selectedTimeFrame], validSubscription.name, getLocalDateTime());
                    const result = await this.dataSource.getRepository(Subscription).save(subscription);
                    return {
                        message: "Subscried successfully",
                        data: {
                            ...result,
                            strategyName: strategyExists.name,
                            brokerClientName: clientExists.cname
                        },
                    };
                } else {
                    throw new Yup.ValidationError("Already subscribed", '', 'subscription');
                }
            }
            throw new Yup.ValidationError("Failed to subscribe", '', 'subscription');
        } catch(error: any) {
            const errorDetails = {
                error: {
                    [error.path]: `${error.errors.join()}`
                }
            }
           return errorDetails;
        }
    }

    async fetchSubscription(userId: string): Promise<IResponse> {
        const brokerClientRepository = await this.dataSource.getRepository(BrokerClient);
        const brokerClients = await brokerClientRepository.find({ where: { userId } });
        if (brokerClients.length > 0) {
            const brokerClientIds = brokerClients.map(client => client.id);
            const subscriptions = await this.dataSource
                .createQueryBuilder(Subscription,'subscription')
                .select("*")
                .andWhere('subscription.brokerClientId IN (:...brokerClientId)')
                .setParameter('brokerClientId', brokerClientIds)
                .getRawMany();
            if (subscriptions.length > 0) {
                const strategies: IStrategy[] = await this.dataSource.createQueryBuilder(Strategy, 'strategy').select("*").getRawMany();
                if (strategies.length > 0) {
                    let accumulator: Record<string, string> = {};

                    const strategyMap = strategies.reduce((acc, strategy)=>{
                        acc[strategy.sid] = strategy.name;
                        return acc;
                    }, accumulator);

                    accumulator = {};
                    const brokerClientMap = brokerClients.reduce((acc, client)=>{
                        acc[client.id] = client.cname;
                        return acc;
                    }, accumulator);

                    const finalSubscriptionData: ISubscriptionData[] = subscriptions.map(subscription => {
                        return {
                            ...subscription,
                            strategyName: strategyMap[subscription.strategyId],
                            brokerClientName: brokerClientMap[subscription.brokerClientId]
                        }
                    });

                    return {
                        data: finalSubscriptionData
                    }
                }
            }
        }
        return {
            data: []
        }
    }

    async updateSubscription (inputData: Record<string, any>, userId: string): Promise<IResponse> {
        // TODO: Logic for update
        return {
            data: {}
        }
    }

}