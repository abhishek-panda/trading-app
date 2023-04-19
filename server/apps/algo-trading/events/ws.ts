import EventEmitter from 'events';
import WSModel from "../../algo-trading/models/wsModel";

const WSEvent = new EventEmitter();


WSEvent.on('register', registerWS);
WSEvent.on('unregister', unregisterWS);

function registerWS(inputs: string) {
    const payload = JSON.parse(inputs) as Record<string, string>;
    if (
        (payload.apiKey && typeof payload.apiKey === 'string') && 
        (payload.accessToken && typeof payload.accessToken === 'string')
    ) {
        const wsModel = new WSModel();
        wsModel.initializeWS(payload.apiKey, payload.accessToken);
    }
}

function unregisterWS(apiKey: string) {
    if (apiKey && typeof apiKey === 'string') {
        const wsModel = new WSModel();
        wsModel.uninitializeWS(apiKey);
    }
}

export default WSEvent;