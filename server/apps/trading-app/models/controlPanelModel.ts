import { DataSource, EntityManager } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import path from "node:path";
import fsPromise from 'node:fs/promises';
import fs from 'fs';
import {parse} from 'papaparse';
import * as Typings from '../../../typings';
import { IResponse, IStrategy, TradingTimeFrame } from '../../../../libs/typings';
import { validStrategySchema } from '../../../../libs/utils';
import Strategy from "../../../entities/Strategy";
import BrokerClient from "../../../entities/BrokerClient";
import KiteConnect from "../../algo-trading/core/kite-connect";
import RabbitMQEvent, { RBMQEvents } from "../../algo-trading/events/rabbit";
import WebSocketEvent, { WSEvents } from "../../algo-trading/events/ws";
import StrategyLeg from "../../../entities/StrategyLeg";



export default class ControlPanelModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

   async registerStrategy(registrationData: IStrategy, userId: string, callfilePath: string, putfilePath: string): Promise<IResponse> {
       
        let result = {};
        await this.dataSource.transaction(async (entitymanager: EntityManager) => {
            const queryRunner = entitymanager.queryRunner;
            try {
                if (queryRunner) {
                    await queryRunner.startTransaction();

                    const validStrategy = await validStrategySchema.validate(registrationData);
                    const callInstrumentName = registrationData.callInstrumentName as string ?? '';
                    const putInstrumentName = registrationData.putInstrumentName as string ?? '';

                    const parsedCallData = await this.parseUploadedFile(callfilePath, callInstrumentName);
                    const parsedPutData = await this.parseUploadedFile(putfilePath, putInstrumentName);
        
                    if (parsedCallData.error || parsedPutData.error) {
                        throw new Error("Failed to parse file data")
                    }
                    callfilePath = parsedCallData.data as string;
                    putfilePath = parsedPutData.data as string;


                    // @ts-ignore
                    const selectedTimeFrame = Object.keys(TradingTimeFrame).find(value => TradingTimeFrame[value] === validStrategy.timeframe);
                    const strategyExists = await this.dataSource.getRepository(Strategy).findOneBy({ sid: validStrategy.sid});


                    if (selectedTimeFrame && !strategyExists) {
                        // @ts-ignore
                        const strategy = new Strategy(validStrategy.sid, validStrategy.name,  TradingTimeFrame[selectedTimeFrame],  validStrategy.description);
                        const savedStrategy = await entitymanager.save(strategy);

                        const brokerClient = await this.dataSource.getRepository(BrokerClient).findOneBy({ userId: userId });
                        if (brokerClient) {
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
                                const callStrategyLeg = new StrategyLeg(savedStrategy, callInstrumentName, callInstrumentId, callfilePath);
                                const putStrategyLeg = new StrategyLeg(savedStrategy,putInstrumentName, putInstrumentId, putfilePath);
                                const callResult = await entitymanager.save(callStrategyLeg);
                                const putResult = await entitymanager.save(putStrategyLeg);
                                if (callResult && putResult) {
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
                                    
                                    await queryRunner.commitTransaction();
                                    const eventpayload = { apiKey , instrument: filesToSink.map(instrument => instrument.id)};
                                    WebSocketEvent.emit(WSEvents.SUBSCRIBE_INSTRUMENT, eventpayload);
                                    result = {
                                        message: "Subscried successfully",
                                        data: [callResult, putResult],
                                    };
                                } else {
                                    throw new Error("Failed to create trade setup");
                                }
                            } else {
                                throw new Error("Failed to get instrument quotes");
                            }
                        } else {
                            throw new Yup.ValidationError("Admin broker client doesn't exists", '', 'strategy');
                        }
                    } else {
                        throw new Yup.ValidationError("Strategy already exists.", '', 'strategy');
                    }
                }
            } catch (error: any) {
                await queryRunner?.rollbackTransaction();
                result = {
                    error: {
                        [error.path]: `${error.errors.join()}`
                    }
                }
            }
       });
       return result;
   }


   async updateStrategy(registrationData: IStrategy, userId: string, callfilePath: string, putfilePath: string): Promise<IResponse> {
        let result = {};
        await this.dataSource.transaction(async (entitymanager: EntityManager) => {
            const queryRunner = entitymanager.queryRunner;
            try {
                if (queryRunner) {
                    await queryRunner.startTransaction();
                    const validStrategy = await validStrategySchema.validate(registrationData);
                    const callInstrumentName = registrationData.callInstrumentName as string ?? '';
                    const putInstrumentName = registrationData.putInstrumentName as string ?? '';

                    const parsedCallData = await this.parseUploadedFile(callfilePath, callInstrumentName);
                    const parsedPutData = await this.parseUploadedFile(putfilePath, putInstrumentName);
        
                    if (parsedCallData.error || parsedPutData.error) {
                        throw new Error("Failed to parse file data")
                    }
                    callfilePath = parsedCallData.data as string;
                    putfilePath = parsedPutData.data as string;

                    // @ts-ignore
                    const selectedTimeFrame = Object.keys(TradingTimeFrame).find(value => TradingTimeFrame[value] === validStrategy.timeframe);
                    const strategyExists = await this.dataSource.getRepository(Strategy).findOneBy({ sid: validStrategy.sid});

                    if (selectedTimeFrame && strategyExists) {
                         // @ts-ignore
                        const strategy = new Strategy(validStrategy.sid, validStrategy.name,  TradingTimeFrame[selectedTimeFrame],  validStrategy.description);

                        await entitymanager.update(Strategy, 
                            {sid: strategy.sid},
                            {name: strategy.name, description: strategy.description, timeframe: strategy.timeframe}
                        );

                        const brokerClient = await this.dataSource.getRepository(BrokerClient).findOneBy({ userId: userId });
                        if (brokerClient) {
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
                                const callStrategyLeg = new StrategyLeg(strategy, callInstrumentName, callInstrumentId, callfilePath);
                                const putStrategyLeg = new StrategyLeg(strategy,putInstrumentName, putInstrumentId, putfilePath);
                                await entitymanager.delete(StrategyLeg, { strategyId: strategy.sid });
                                const callResult = await entitymanager.save([callStrategyLeg);
                                const putResult = await entitymanager.save(putStrategyLeg);
                                if (callResult && putResult) {
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
                                    
                                    await queryRunner.commitTransaction();
                                    const eventpayload = { apiKey , instrument: filesToSink.map(instrument => instrument.id)};
                                    WebSocketEvent.emit(WSEvents.SUBSCRIBE_INSTRUMENT, eventpayload);
                                    result = {
                                        message: "Updated successfully",
                                        data: [callResult, putResult],
                                    };
                                } else {
                                    throw new Yup.ValidationError("Failed to update trade", '', 'strategy');
                                }
                            } else {
                                throw new Yup.ValidationError("Failed to get instrument quotes", '', 'strategy');
                            }
                        } else {
                            throw new Yup.ValidationError("Admin broker client doesn't exists", '', 'strategy');
                        }
                    } else {
                        throw new Yup.ValidationError("Strategy doesn't exists. Failed to update", '', 'strategy');
                    }
                }
            } catch(error: any) {
                await queryRunner?.rollbackTransaction();
                result = {
                    error: {
                        [error.path]: `${error.errors.join()}`
                    }
                }
            }
        });
        return result;
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
            const tickData = results[index] as Typings.TickData;

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

   async getStrategies(): Promise<IResponse> {

    const result = await this.dataSource
            .getRepository(Strategy)
            .createQueryBuilder("strategy")
            .innerJoinAndSelect("strategy.strategyLeg", "strategyLeg")
            .getMany();
        return {
            data: result
        };
    }
}