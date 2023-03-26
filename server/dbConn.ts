import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from './apps/shared/entities/User'; 

export default class DBConn {
    private static instance: DataSource;

    private constructor() { }

    public static getInstance(): DataSource {
        if (!DBConn.instance) {
            DBConn.instance = new DataSource({
                type: "mysql",
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT ?? '3306'),
                username: process.env.DB_USER ?? '',
                password: process.env.DB_USER_PWD ?? '',
                database: process.env.DB_NAME ?? 'algo_trading',
                synchronize: true,
                entities: [User],
                logging: false,
                dropSchema: true,
            });
        }

        return DBConn.instance;
    }
}
