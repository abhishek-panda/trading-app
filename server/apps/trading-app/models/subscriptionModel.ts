import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { IResponse, TradingTimeFrame } from "../../../../libs/typings";
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
                const subscriptionRepository = await this.dataSource.getRepository(Subscription)
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
                        data: result,
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

}