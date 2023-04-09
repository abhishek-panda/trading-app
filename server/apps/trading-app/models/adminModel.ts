import { DataSource } from "typeorm";
import DBConn from "../../../dbConn";
import * as Yup from 'yup';
import { IResponse, IStrategy } from '../../../../libs/typings';
import { validStrategySchema } from '../../../../libs/utils';
import Strategy from "../../../entities/Strategy";



export default class AdminModel {

    private dataSource: DataSource;

    constructor() {
        this.dataSource = DBConn.getInstance();
    }

   async registerStrategy(registrationData: IStrategy): Promise<IResponse> {
        try {
            const validStrategy = await validStrategySchema.validate(registrationData);
            const strategyRepository = this.dataSource.getRepository(Strategy);
            const strategyExists = await strategyRepository.findOneBy({ sid: validStrategy.sid});
            if (!strategyExists) {
                const strategy = new Strategy(validStrategy.sid, validStrategy.name, validStrategy.description);
                const savedStrategy = await strategyRepository.save(strategy);
                const { sid, name, description } = savedStrategy;
                return {
                    message: "Strategy registered successfully",
                    data: {
                        sid, name, description
                    },
                }
            } else {
                throw new Yup.ValidationError("Strategy already exists.", '', 'strategy');
            }
        } catch(error: any) {
            const errorDetails = {
                error: {
                    [error.path]: `${error.errors.join()}`
                }
            }
           return errorDetails;
        }
   }

   async getStrategies(): Promise<IResponse> {
        const brokerClients: IStrategy[] = await this.dataSource
            .createQueryBuilder()
            .select(["sid", "name", "description"])
            .from(Strategy, "stategy")
            .getRawMany();
        return {
            data: brokerClients
        };
    }
}