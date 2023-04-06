import { IBrokerClient } from "../libs/typings";

export enum ENV_OPERATION {
    ADD_REPLACE = 'ADD_REPLACE',
    REMOVE = 'REMOVE'
}

export enum BOOLEAN {
    TRUE='true',
    FALSE='false'
}

export interface SBrokerClient extends IBrokerClient {
    accessToken: string;
}
