import { DataSource } from "typeorm";
import path from "node:path";
import fsPromise from 'node:fs/promises';
import fs from 'fs';
import {parse} from 'papaparse';
import DBConn from "../../../dbConn";
import * as Typings from '../../../typings';
import { IResponse, UserRole } from "../../../../libs/typings";
import TradeSetup from "../../../entities/TradeSetup";
import RabbitMQEvent, { RBMQEvents } from "../../algo-trading/events/rabbit";
import WebSocketEvent, { WSEvents } from "../../algo-trading/events/ws";
import Strategy from "../../../entities/Strategy";
import User from "../../../entities/User";
import BrokerClient from "../../../entities/BrokerClient";

export default class TradeSetupModel {
    private dataSource: DataSource

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async setup(inputData: Record<string, any>, userId: string, callfilePath: string, putfilePath: string ): Promise<IResponse> {
        try {
            // TODO:  all input / schema validation to be done later
            const strategyId = inputData.strategy as string;
            const callInstrumentName = inputData.callInstrumentName as string ?? '';
            const putInstrumentName = inputData.putInstrumentName as string ?? '';
            
            const parsedCallData = await this.parseUploadedFile(callfilePath, callInstrumentName);
            const parsedPutData = await this.parseUploadedFile(putfilePath, putInstrumentName);
            
            if (parsedCallData.error || parsedPutData.error) {
                throw new Error("Failed to parse file data")
            }
            callfilePath = parsedCallData.data as string;
            putfilePath = parsedPutData.data as string;
            
            let callInstrumentId = ''; // Update instrument id later
            let putInstrumentId = ''; // Update instrument id later
        
            const strategy = await this.dataSource.getRepository(Strategy).findOneBy({sid: strategyId});
            const tradeSetupExists =  await this.dataSource.getRepository(TradeSetup).findOneBy({sid: strategyId});
            if(!tradeSetupExists && strategy) {
                const tradeSetup = new TradeSetup(strategyId, callInstrumentName, callInstrumentId, callfilePath, putInstrumentName, putInstrumentId, putfilePath);
                const result = await this.dataSource.getRepository(TradeSetup).save(tradeSetup);
                const admin = await this.dataSource.getRepository(User).findOneBy({role: UserRole.ADMIN });
                const brokerClient = await this.dataSource.getRepository(BrokerClient).findOneBy({ id: admin?.id });
                if (result && admin && brokerClient) {
                    const filesToSink = [
                        {
                            id: callInstrumentId,
                            path: callfilePath
                        }, 
                        { 
                            id: putInstrumentId,
                            path: putfilePath
                        }
                    ];
                    // Find admin client and strategy
                    
                    filesToSink.forEach(function(fileObj) {
                        fs.readFile(fileObj.path, 'utf8', function(readError, contents) {
                            if (readError) {
                                throw new Error("Unable to parse content")
                            }
                           
                            const parsedContents = {
                                ...JSON.parse(contents),
                                id: fileObj.id,
                                timeframe: strategy.timeframe,
                            };

                            const eventpayload = { apiKey: brokerClient.apiKey , instrument: [fileObj.id] };
                            
                            RabbitMQEvent.emit(RBMQEvents.SINK_DATA, parsedContents);
                            WebSocketEvent.emit(WSEvents.SUBSCRIBE_INSTRUMENT, eventpayload);
                        });
                    })
                    return {
                        message: "Subscried successfully",
                        data: result,
                    };

                } else {
                    throw new Error('Failed to create a new trade setup');
                }
            } else {
                throw new Error("Tradesetup already exists");
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
            const offsetMinutes = parseInt(process.env.TIMEZONE_MIN_OFFSET ?? '330');
            
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
            const newFilePath = path.join(computeDirectory, `${filename}.json`);
            await fsPromise.writeFile(newFilePath, JSON.stringify(scripTickerData, null, 2));
            return {
                message: "File processed successfully",
                data: newFilePath,
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