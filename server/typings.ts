import { IBrokerClient } from "../libs/typings";

export enum ENV_OPERATION {
    ADD_REPLACE = 'ADD_REPLACE',
    REMOVE = 'REMOVE'
}

export interface SBrokerClient extends IBrokerClient {
    accessToken: string;
}
