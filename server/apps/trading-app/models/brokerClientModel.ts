import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { BrokenClientRegistation, IResponse } from "../../../../libs/typings";
import { validateBrokerClientSchema } from '../../../../libs/utils';
import BrokerClient from "../../../entities/BrokerClient";
import User from "../../../entities/User";


export default class BrokerClientModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

    async registerClient(registrationData: BrokenClientRegistation, userId: string) : Promise<IResponse> {
        try {
            const validBrokerClient = await validateBrokerClientSchema.validate(registrationData);
            const user = await this.dataSource.getRepository(User).findOneBy({ id: userId})
            
            if (user) {
                const brokerClientRepository = this.dataSource.getRepository(BrokerClient);
                const clientExists = await brokerClientRepository.findOneBy({ apiKey: validBrokerClient.apiKey});
                if (!clientExists) {
                    const brokerClient = new BrokerClient(validBrokerClient.cname, registrationData.broker, validBrokerClient.apiKey, user);
                    const savedBrokerClient = await brokerClientRepository.save(brokerClient);
                    return {
                        message: "Client registered successfully",
                        data: savedBrokerClient,
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
}