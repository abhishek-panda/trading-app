import "reflect-metadata";
import { DataSource } from "typeorm";
import Entites from './entities';

export default class DBConn {
    private static instance: DataSource;

    private constructor() { }

    public static getInstance(): DataSource {
        if (!DBConn.instance) {
            DBConn.instance = new DataSource({
                type: "mysql",
                timezone: process.env.TZ,
                host: process.env.DB_HOST,
                port: parseInt(process.env.DB_PORT ?? '3306'),
                username: process.env.DB_USER ?? '',
                password: process.env.DB_USER_PWD ?? '',
                database: process.env.DB_NAME ?? 'algo_trading',
                synchronize: true,
                entities: Entites,
                logging: false,
                dropSchema: false,
            });
        }

        return DBConn.instance;
    }
}
