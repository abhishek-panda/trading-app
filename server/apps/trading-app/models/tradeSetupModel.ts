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
import KiteConnect from "../../algo-trading/core/kite-connect";


// TODO: Their is an issue with emas other than 5 ema unable read from CSV file
interface MATickData extends Typings.TickData {
    'MA ‌ma‌ (5,ema,0)': string;
    'MA ‌ma‌ (9,ema,0)'?: string; 
    'MA ‌ma‌ (20,ema,0)'?: string;
    'MA ‌ma‌ (50,ema,0)' ?: string;
};

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
            console.log(parsedCallData.error)
            console.log(parsedPutData.error)
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
                const admin = await this.dataSource.getRepository(User).findOneBy({role: UserRole.ADMIN });
                const brokerClient = await this.dataSource.getRepository(BrokerClient).findOneBy({ userId: admin?.id });
                if (admin && brokerClient) {
                    const { apiKey, accessToken } = brokerClient;
                    const kiteConnect = new KiteConnect(apiKey);
                    const instrumenQuotes = await kiteConnect.getQuote(accessToken, [callInstrumentName, putInstrumentName]);
                    if (instrumenQuotes && instrumenQuotes[callInstrumentName] && instrumenQuotes[putInstrumentName]) {
                        const callInstrumentId = instrumenQuotes[callInstrumentName].instrument_token;
                        const putInstrumentId = instrumenQuotes[putInstrumentName].instrument_token;
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
                        const tradeSetup = new TradeSetup(strategyId, callInstrumentName, callInstrumentId, callfilePath, putInstrumentName, putInstrumentId, putfilePath);
                        const result = await this.dataSource.getRepository(TradeSetup).save(tradeSetup);
                        if (result) {
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
                                    
                                    RabbitMQEvent.emit(RBMQEvents.SINK_DATA, parsedContents);
                                });
                            });
                            const eventpayload = { apiKey , instrument: filesToSink.map(instrument => instrument.id)};
                            WebSocketEvent.emit(WSEvents.SUBSCRIBE_INSTRUMENT, eventpayload);
                            return {
                                message: "Subscried successfully",
                                data: result,
                            };
                        } else {
                            throw new Error("Failed to create trade setup");
                        }
                    } else {
                        throw new Error("Failed to get instrument quotes");
                    }
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
            const totalRecords = results.length;
            const preprocessedRecordCount = parseInt(process.env.PREPROCESSED_RECORD ?? '0');
            const startsAt = totalRecords <=  preprocessedRecordCount ? 0 : totalRecords - preprocessedRecordCount;
            for (let index = startsAt; index < totalRecords; index++) {
                const tickData = results[index] as MATickData;

                const tickDataDateObj = new Date(tickData['Date']);
                tickDataDateObj.setMinutes(tickDataDateObj.getMinutes() + offsetMinutes);

                const tick= {
                    "timestamp":`${tickDataDateObj.toISOString().split('.')[0]}.000`,
                    "open": parseFloat(tickData['Open']),
                    "high": parseFloat(tickData['High']),
                    "low": parseFloat(tickData['Low']),
                    "close": parseFloat(tickData['Close']),
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