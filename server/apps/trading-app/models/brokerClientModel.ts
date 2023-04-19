import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { validClientTokenRequestSchema, validCid, cache } from '../../../utils';
import { SBrokerClient } from '../../../typings';
import { BrokenClientRegistation, IResponse, BOOLEAN, BROKER } from "../../../../libs/typings";
import { validBrokerClientSchema} from '../../../../libs/utils';
import BrokerClient from "../../../entities/BrokerClient";
import User from "../../../entities/User";
import KiteConnectModel from "../../algo-trading/core/kite-connect";
import WSModel from "../../algo-trading/models/wsModel";



export default class BrokerClientModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async registerClient(registrationData: BrokenClientRegistation, userId: string) : Promise<IResponse> {
        try {
            const validBrokerClient = await validBrokerClientSchema.validate(registrationData);
            // @ts-ignore
            const selectedBroker = Object.keys(BROKER).find(value => BROKER[value] === validBrokerClient.broker);
            const user = await this.dataSource.getRepository(User).findOneBy({ id: userId});

            if (user && selectedBroker) {
                const brokerClientRepository = this.dataSource.getRepository(BrokerClient);
                const clientExists = await brokerClientRepository.findOneBy({ apiKey: validBrokerClient.apiKey});
                if (!clientExists) {
                    // @ts-ignore
                    const brokerClient = new BrokerClient(validBrokerClient.cname, BROKER[selectedBroker], validBrokerClient.apiKey, validBrokerClient.secret, user);
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

    /**
     * Create WS client if it doesn't exists.
     */
    async updateClient(userInput: Record<string, any>, userId: string): Promise<IResponse> {
        try {
            if (userInput.updateType === 'validate') {

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
                        cache.del(`WS_${client.apiKey}`);
                        throw new Yup.ValidationError(accessToken.message, '', 'token');
                    }
                    const result = await this.dataSource.getRepository(BrokerClient).update({ id: validTokenRequest.cid }, { accessToken });
                    const wsModel = new WSModel();
                    wsModel.initializeWS(client.apiKey, accessToken)
                    if (result.affected) {
                        return {
                            message: "Client activated successfully"
                        };
                    }
                }
            }
            else if (userInput.updateType === 'update') {
                const validBrokerClientId = await Yup.string().matches(validCid).isValid(userInput.cid as string ?? "");
                const validStatus = await Yup.mixed().oneOf(Object.values(BOOLEAN)).isValid(userInput.status as BOOLEAN ?? BOOLEAN.FALSE);
                if (validBrokerClientId && validStatus) {
                    const result = await this.dataSource.getRepository(BrokerClient).update({ id: userInput.cid }, {isEnabled: userInput.status});
                    const client = await this.getClient(userId, userInput.cid);
                    if (result.affected) {
                        return {
                            message: "Client updated successfully",
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


    /**
     * Internal Usage for WS
     */
    async getAllActiveClients(): Promise<SBrokerClient[]> {
        const clients:  SBrokerClient[] =  await this.dataSource
                .createQueryBuilder()
                .select(["id", "cname", "broker", "apiKey", "accessToken", "isEnabled"])
                .from(BrokerClient, "brokerClient")
                .where("brokerClient.isEnabled = :enabled")
                .setParameters({ enabled: BOOLEAN.TRUE })
                .getRawMany();
        return clients;
    }
}