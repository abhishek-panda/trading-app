import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { IResponse, IStrategy, TradingTimeFrame, ISubscriptionData, BOOLEAN, } from "../../../../libs/typings";
import { validSubscriptionSchema, validStrategyId, validBrokerClientId } from "../../../../libs/utils";
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
            const clientExists = await this.dataSource.getRepository(BrokerClient).findOneBy({ id:  validSubscription.brokerClientId, userId });
            const strategyExists = await this.dataSource.getRepository(Strategy).findOneBy({ sid: validSubscription.strategyId });
            if (clientExists && strategyExists) {
                const subscriptionRepository = this.dataSource.getRepository(Subscription);
                // check if subscription exists
                const subscriptionExists =  await subscriptionRepository.findOneBy({
                    brokerClientId: validSubscription.brokerClientId,
                    strategyId:  validSubscription.strategyId
                });
                if (!subscriptionExists) {
                    const subscription = new Subscription(validSubscription.brokerClientId, validSubscription.strategyId, validSubscription.name, getLocalDateTime());
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
        const brokerClientRepository = this.dataSource.getRepository(BrokerClient);
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

    async updateSubscription (userInput: Record<string, any>, userId: string): Promise<IResponse> {
        // TODO: Logic for update
        const validBrokerClient = await Yup.string().matches(validBrokerClientId).isValid(userInput.brokerClientId as string ?? "");
        const validStrategy = await Yup.string().matches(validStrategyId).isValid(userInput.strategyId as string ?? "");
        const validTestMode = await Yup.mixed().oneOf(Object.values(BOOLEAN)).isValid(userInput.testMode as BOOLEAN ?? BOOLEAN.FALSE);
        const validIsActive = await Yup.mixed().oneOf(Object.values(BOOLEAN)).isValid(userInput.isActive as BOOLEAN ?? BOOLEAN.FALSE);

       if (validBrokerClient && validStrategy && validTestMode && validIsActive) {
            const subscriptionRespository = this.dataSource.getRepository(Subscription);
            const result = await subscriptionRespository
                .update(
                    { brokerClientId : userInput.brokerClientId, strategyId: userInput.strategyId },
                    { testMode: userInput.testMode, isActive: userInput.isActive }
                );
            const subscription = await subscriptionRespository.findOneBy({ brokerClientId : userInput.brokerClientId, strategyId: userInput.strategyId });
            if (result.affected) {
                return {
                    data: subscription,
                    message: "Client activated successfully"
                }
            }
       }
        return {
            error: {
                "subscription": "Failed to update subscription"
            }
        };
    }

    async getBrokerClients(strategyId: string) {
        return await this.dataSource
            .getRepository(BrokerClient)
            .createQueryBuilder("brokerclient")
            .innerJoin("brokerclient.subscription", "subscription")
            .where("subscription.strategyId = :strategyId", { strategyId: strategyId })
            .getMany();
    }
}