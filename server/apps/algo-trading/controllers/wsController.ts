import WSModel from "../models/wsModel";

export default class WSController {
    
    private wsModel: WSModel;

    constructor() {
        this.wsModel = new WSModel();
    }
    initialize(apiKey: string, accessToken: string) {
        this.wsModel.initializeWS(apiKey,accessToken);
    }
    initializeAll () {
        this.wsModel.initializeAll();
    }

}