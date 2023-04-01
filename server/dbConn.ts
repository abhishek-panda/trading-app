import "reflect-metadata";
import { DataSource } from "typeorm";
import User from './entities/User';
import UserSession from "./entities/UserSession";

export default class DBConn {
    private static instance: DataSource;

    private constructor() { }

    public static getInstance(): DataSource {
        console.log("Timezone", process.env.TZ);
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
                entities: [
                    User,
                    UserSession
                ],
                logging: true,
                // dropSchema: true,
            });
        }

        return DBConn.instance;
    }
}
