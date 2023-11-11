import BrokerClientModel from "../../trading-app/models/brokerClientModel";
import wsModel from "../models/wsModel";

export default class WSController {
    
    private wsModel: typeof wsModel;
    private instruments: number[] = [];
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
        const tempSubscription = [...this.instruments];
        this.unsubscribeAll(apiKey);
        this.instruments = Array.from(new Set(tempSubscription.concat(instruments)));
        return this.wsModel.subscribe(apiKey, this.instruments);
    }

    unsubscribe(apiKey: string, instruments: number[]) {
        if (instruments.length > 0) {
            this.wsModel.unsubscribe(apiKey, instruments);
            this.instruments = this.instruments.filter(function (ins) {
                return !instruments.includes(ins);
            });
        }
    }

    unsubscribeAll(apiKey: string) {
        if (this.instruments.length > 0) {
            this.wsModel.unsubscribe(apiKey, this.instruments);
            this.instruments = [];
        }
    }

    //TODO: uninitialize WS
    uninitializeWS(apiKey: string) {
        this.wsModel.uninitializeWS(apiKey);
    }

}