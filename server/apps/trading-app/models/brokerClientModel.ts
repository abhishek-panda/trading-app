import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { validClientTokenRequestSchema } from '../../../utils';
import { BrokenClientRegistation, IResponse, IBrokerClient, IValidateClient } from "../../../../libs/typings";
import { validBrokerClientSchema } from '../../../../libs/utils';
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
                    const { id, cname, apiKey, broker, isActive} = savedBrokerClient;
                    return {
                        message: "Client registered successfully",
                        data: {
                            id, cname, apiKey, broker, isActive
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
        const brokerClients: IBrokerClient[] = await this.dataSource
            .createQueryBuilder()
            .select(["id", "cname", "broker", "apiKey", "isActive"])
            .from(BrokerClient, "brokerClient")
            .where("brokerClient.userId = :userId")
            .setParameters({ userId })
            .getRawMany();
        
        // console.log("brokerClients", brokerClients);
        return {
            data: brokerClients
        };
    }

    async updateClient(userInput: IValidateClient, userId: string): Promise<IResponse> {
        try {
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
                } else {
                    throw new Yup.ValidationError("Failed to activate client", '', 'client');
                }
            }
            throw new Yup.ValidationError("Unauthorized", '', 'user');
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