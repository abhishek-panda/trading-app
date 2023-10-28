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
import BrokerClient from "../../../entities/BrokerClient";
import WebSocketEvent, { WSEvents } from "../../algo-trading/events/ws";
import KiteConnect from "../../algo-trading/core/kite-connect";
import RabbitMQEvent, { RBMQEvents } from "../../algo-trading/events/rabbit";

export default class InstrumentModel {
    private dataSource: DataSource

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async subscribe(inputData: Record<string, any>, userId: string, filePath: string ): Promise<IResponse> {

        try {
            // TODO:  all input / schema validation to be done later
            const subscriptions = inputData.subscriptions as string;
            const timeframe = inputData.timeframe as string;
            const instrumentName = inputData.instrumentName as string ?? '';

            const parsedData =  await this.parseUploadedFile(filePath, instrumentName);
            if (parsedData.error) {
                throw new Error(parsedData.error.details);
            }
           

            // Fetch instrument id from zerodha

            let instrumentId = ''; // Update instrument id later
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
                        name: instrumentName
                    });
                    if (!instrumentExists && selectedTimeFrame) {
                    // @ts-ignore
                        const tf = TradingTimeFrame[selectedTimeFrame] as TradingTimeFrame;
                        const instrument = new Instrument(tf, usls.id, instrumentName, filePath, instrumentId);
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
                    for(let item of results) {
                        const subscription = await this.dataSource.getRepository(Subscription).findOneBy({ id: item.sid });
                        if (subscription?.id) {
                            const brokerClient = await this.dataSource.getRepository(BrokerClient).findOneBy({ id: subscription?.brokerClientId });
                            if (brokerClient?.id) {
                                // start and subscribe to ws and update db to connected
                                const { apiKey, accessToken } = brokerClient;
                                const kiteConnect = new KiteConnect(apiKey);
                                const currentTickerQuote = await kiteConnect.getQuote(accessToken, [instrumentName]);
                                if (!(currentTickerQuote instanceof Error) && currentTickerQuote[instrumentName]) {
                                    instrumentId = currentTickerQuote[instrumentName].instrument_token;
                                    const updateResult = await this.dataSource.getRepository(Instrument).update({ sid: item.sid, name: instrumentName, timeframe: item.timeframe }, {iId: instrumentId});
                                    if (updateResult) {
                                        const eventpayload = { apiKey, instrument: [instrumentId] };
                                        
                                        // Adding instrument to previously parsed csv file content as instrument id wasn't available
                                        const contents =    fs.readFileSync(filePath, 'utf8');
                                        const parsedContents = JSON.parse(contents);
                                        parsedContents['id'] = instrumentId;

                                        RabbitMQEvent.emit(RBMQEvents.SINK_DATA, parsedContents);
                                        WebSocketEvent.emit(WSEvents.SUBSCRIBE_INSTRUMENT, eventpayload);

                                    } else {
                                        throw new Error(`Failed to update instrument id`)
                                    }
                                } else {
                                    throw new Error(currentTickerQuote.message);
                                } 
                            }
                        }
                    }

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
            const offsetMinutes = 330; // 5 hours and 30 minutes offset for IST
            
            const scripTickerData = {
                name: filename,
                ticks: [] as Record<string, unknown>[]
            };
            for (let index = 0; index < results.length; index++) {
                const tickData = results[index] as Typings.TickData;

                const tickDataDateObj = new Date(tickData['Date']);
                tickDataDateObj.setMinutes(tickDataDateObj.getMinutes() + offsetMinutes);

                const tick= {
                    timestamp:`${tickDataDateObj.toISOString().split('.')[0]}.000`,
                    open: parseFloat(tickData['Open']),
                    high: parseFloat(tickData['High']),
                    low: parseFloat(tickData['Low']),
                    close: parseFloat(tickData['Close']),
                    volume: parseFloat(tickData['Volume'].replace(/,/g, ''))
                };
                scripTickerData.ticks.push(tick);
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