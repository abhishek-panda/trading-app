import { DataSource } from "typeorm";
import fsPromise from 'node:fs/promises';
import {parse} from 'papaparse';
import fs from 'fs';
import DBConn from "../../../dbConn";
import Subscription from "../../../entities/Subscription";
import { BOOLEAN, IResponse, TradingTimeFrame } from "../../../../libs/typings";
import * as Typings from '../../../typings';
import SubscriptionModel from "./subscriptionModel";
import Instrument from "../../../entities/Instrument";
import path from "node:path";

export default class InstrumentModel {
    private dataSource: DataSource

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async subscribe(inputData: Record<string, any>, userId: string, filename: string, filePath: string ): Promise<IResponse> {

        try {
            const parsedData =  await this.parseUploadedFile(filePath, filename);
            if (parsedData.error) {
                throw new Error(parsedData.error.details);
            }
            // TODO:  all input / schema validation to be done later
            const subscriptions = inputData.subscriptions as string;
            const timeframe = inputData.timeframe as string;
            // @ts-ignore
            const selectedTimeFrame = Object.keys(TradingTimeFrame).find(value => TradingTimeFrame[value] === timeframe);
            const allSids = subscriptions.split(',');
            const subscriptionModel = new SubscriptionModel();
            const userAllSubscriptions = await subscriptionModel.fetchSubscription(userId);
            let userAllLiveSubscriptions: Subscription[] = [];
            if(userAllSubscriptions.data && userAllSubscriptions.data.length > 0) {
                userAllLiveSubscriptions = userAllSubscriptions.data.filter((subscription: Subscription) => subscription.isActive == BOOLEAN.TRUE && subscription.timeframe == timeframe);
            } else {
                throw new Error(`Strategy Subscription doesn't exits`);
            }

            const userSelectedLiveSubscription = userAllLiveSubscriptions.filter((subscription : Subscription) => {
                const sid = subscription.id;
                return allSids.includes(sid);
            });
            if (userSelectedLiveSubscription.length > 0) {

                // TODO: Handle all instrument insert or rollback or atomic insert
                const errors = [];
                const results = [];
                for (let usls of userSelectedLiveSubscription) {
                    const instrumentExists = await this.dataSource.getRepository(Instrument).findOneBy({ 
                        sid: usls.id,
                        timeframe: usls.timeframe,
                        name: filename
                    });
                    if (!instrumentExists && selectedTimeFrame) {
                    // @ts-ignore
                        const tf = TradingTimeFrame[selectedTimeFrame] as TradingTimeFrame;
                        const instrument = new Instrument(tf, usls.id, filename, filePath);
                        const result = await this.dataSource.getRepository(Instrument).save(instrument);
                        results.push(result);
                    } else {
                        errors.push(new Error("Instrument already subscribed"))
                    }
                }
                if (errors.length > 0) {
                    throw new Error(`Failed to subscribe to ${errors.length} instrument`);
                } else {

                    // TODO: Subscribe to ws


                    return {
                        message: "Subscried successfully",
                        data: results,
                    };
                }
            } else {
                throw new Error('Possibly Strategy subscriptions are not live');
            }
        } catch (error: any) {
            const errorDetails = {
                error: {
                    details: error.message
                }
            }
           return errorDetails;
        }
    }

    private async parseUploadedFile(filePath: string, filename: string): Promise<IResponse> {
        try {
            const contents = await fsPromise.readFile(filePath, { encoding: 'utf8'});
            const results = parse(contents, { header: true }).data;

            const scripTickerData = [];
            for (let index = 0; index < results.length; index++) {
                const tickData = results[index] as Typings.TickData;

                const tick= {
                    timestamp:tickData['Date'],
                    open: parseFloat(tickData['Open']),
                    high: parseFloat(tickData['High']),
                    low: parseFloat(tickData['Low']),
                    close: parseFloat(tickData['Close']),
                    volume: parseFloat(tickData['Volume'].replace(/,/g, ''))
                }
                scripTickerData.push(tick);
            }

            const computeDirectory = process.env.COMPUTE_DIRECTORY ?? 'compute/';
            if (!fs.existsSync(computeDirectory)){
              fs.mkdirSync(computeDirectory);
            }
            await fsPromise.writeFile(path.join(computeDirectory, `${filename}.json`), JSON.stringify(scripTickerData, null, 2));
            return {
                message: "Subscried successfully",
                data: [],
            };
        } catch(error: any) {
            const errorDetails = {
                error: {
                    details: error.message
                }
            }
           return errorDetails;
        }
    }

}