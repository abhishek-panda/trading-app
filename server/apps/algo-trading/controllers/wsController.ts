import BrokerClientModel from "../../trading-app/models/brokerClientModel";
import wsModel from "../models/wsModel";

export default class WSController {
    
    private wsModel: typeof wsModel;
    private brokerClientModel : BrokerClientModel;

    constructor() {
        this.wsModel = wsModel;
        this.brokerClientModel = new BrokerClientModel();
    }

    initialize(apiKey: string, accessToken: string) {
        this.wsModel.initializeWS(apiKey,accessToken);
    }

    async initializeAll () {
        const clients = await this.brokerClientModel.getAllActiveClients();
        clients.forEach(client => {
            this.initialize(client.apiKey, client.accessToken);
        });
    }

    subscribe(apiKey: string, instruments: number[]) {
        return this.wsModel.subscribe(apiKey, instruments);
    }

    //TODO: uninitialize WS
    uninitializeWS(apiKey: string) {
        this.wsModel.uninitializeWS(apiKey);
    }

}