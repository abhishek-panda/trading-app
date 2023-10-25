import Model from "../../shared/models";

export default class WSController {
    
    private wsModel: typeof Model.wsModel;

    constructor() {
        this.wsModel = Model.wsModel;
    }
    initialize(apiKey: string, accessToken: string) {
        this.wsModel.initializeWS(apiKey,accessToken);
    }
    initializeAll () {
        this.wsModel.initializeAll();
    }

    uninitializeWS(apiKey: string) {
        this.wsModel.uninitializeWS(apiKey);
    }

}