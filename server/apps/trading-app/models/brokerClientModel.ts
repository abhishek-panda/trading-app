import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { validClientTokenRequestSchema, validCid } from '../../../utils';
import { SBrokerClient } from '../../../typings';
import { BrokenClientRegistation, IResponse, BOOLEAN } from "../../../../libs/typings";
import { validBrokerClientSchema} from '../../../../libs/utils';
import BrokerClient from "../../../entities/BrokerClient";
import User from "../../../entities/User";
import KiteConnectModel from "../../algo-trading/models/kiteModel";



export default class BrokerClientModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async registerClient(registrationData: BrokenClientRegistation, userId: string) : Promise<IResponse> {
        try {
            const validBrokerClient = await validBrokerClientSchema.validate(registrationData);
            const user = await this.dataSource.getRepository(User).findOneBy({ id: userId});
            
            if (user) {
                const brokerClientRepository = this.dataSource.getRepository(BrokerClient);
                const clientExists = await brokerClientRepository.findOneBy({ apiKey: validBrokerClient.apiKey});
                if (!clientExists) {
                    const brokerClient = new BrokerClient(validBrokerClient.cname, registrationData.broker, validBrokerClient.apiKey, validBrokerClient.secret, user);
                    const savedBrokerClient = await brokerClientRepository.save(brokerClient);
                    const { id, cname, apiKey, broker, isEnabled} = savedBrokerClient;
                    return {
                        message: "Client registered successfully",
                        data: {
                            id, cname, apiKey, broker, isEnabled
                        },
                    }
                } else {
                    throw new Yup.ValidationError("Client already exists.", '', 'brokerClient');
                }
            } else {
                throw new Yup.ValidationError("Unauthorized", '', 'user');
            }
        }
        catch( error: any) {
            const errorDetails = {
                error: {
                    [error.path]: `${error.errors.join()}`
                }
            }
           return errorDetails;
        }          
    }

    async getClients(userId: string): Promise<IResponse> {
        const brokerClients: SBrokerClient[] = await this.dataSource
            .createQueryBuilder()
            .select(["id", "cname", "broker", "apiKey", "accessToken", "isEnabled"])
            .from(BrokerClient, "brokerClient")
            .where("brokerClient.userId = :userId")
            .setParameters({ userId })
            .getRawMany();
        
     
        const finalResult = await Promise.all(brokerClients.map(async (client) => {
            const { apiKey, accessToken } = client;
            const kiteConnect = new KiteConnectModel(apiKey);
            const profile = await kiteConnect.getProfile(accessToken);
            const isActive = profile instanceof Error ? BOOLEAN.FALSE : BOOLEAN.TRUE; 
            client.isActive = isActive;
            // @ts-ignore
            delete client.accessToken;
            return client
        }));
        return {
            data: finalResult
        };
    }


    async getClient(userId: string, id: string): Promise<IResponse> {
        const brokerClient: SBrokerClient | undefined = await this.dataSource
            .createQueryBuilder()
            .select(["id", "cname", "broker", "apiKey", "accessToken", "isEnabled"])
            .from(BrokerClient, "brokerClient")
            .where("brokerClient.userId = :userId")
            .andWhere("brokerClient.id = :id")
            .setParameters({ userId, id })
            .getRawOne();
        
     
        let finalResult = {};
        if (brokerClient) {
            const { apiKey, accessToken } = brokerClient;
            const kiteConnect = new KiteConnectModel(apiKey);
            const profile = await kiteConnect.getProfile(accessToken);
            const isActive = profile instanceof Error ? BOOLEAN.FALSE : BOOLEAN.TRUE; 
            brokerClient.isActive = isActive;
             // @ts-ignore
            delete brokerClient.accessToken;
            finalResult = brokerClient;
        }

        return {
            data: finalResult
        };
    }


    async updateClient(userInput: Record<string, any>, userId: string): Promise<IResponse> {
        try {
            if (userInput.type === 'validate') {

                const validTokenRequest = await validClientTokenRequestSchema.validate(userInput);
                
                const client =  await this.dataSource
                .createQueryBuilder()
                .select("*")
                .from(BrokerClient, "brokerClient")
                .where("brokerClient.userId = :userId")
                .andWhere("brokerClient.id = :cid")
                .setParameters({ userId, cid: validTokenRequest.cid })
                .getRawOne();
                
                if (client && client.userId === userId) {
                    const kiteConnect = new KiteConnectModel(client.apiKey);
                    const accessToken = await kiteConnect.getAccessToken(validTokenRequest.request_token, client.secret);
                    if (accessToken instanceof Error) {
                        throw new Yup.ValidationError(accessToken.message, '', 'token');
                    }
                    const result = await this.dataSource.getRepository(BrokerClient).update({ id: validTokenRequest.cid }, { accessToken});
                    if (result.affected) {
                        return {
                            message: "Client activated successfully"
                        }
                    }
                }
            }
            else if (userInput.type === 'update') {
                const validBrokerClientId = await Yup.string().matches(validCid).isValid(userInput.cid as string ?? "");
                const validStatus = await Yup.mixed().oneOf(Object.values(BOOLEAN)).isValid(userInput.status as BOOLEAN ?? BOOLEAN.FALSE);
                if (validBrokerClientId && validStatus) {
                    const result = await this.dataSource.getRepository(BrokerClient).update({ id: userInput.cid }, {isEnabled: userInput.status});
                    const client = await this.getClient(userId, userInput.cid);
                    if (result.affected) {
                        return {
                            message: "Client status changed successfully",
                            data: client.data
                        };
                    }
                }
            }
            throw new Yup.ValidationError("Failed to activate client", '', 'client');
        } catch (error: any) {
            const errorDetails = {
                error: {
                    [error.path]: `${error.errors.join()}`
                }
            }
           return errorDetails;
        }
    }
}