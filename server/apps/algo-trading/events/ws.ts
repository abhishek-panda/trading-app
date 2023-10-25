import EventEmitter from 'events';
import WSController from '../../algo-trading/controllers/wsController';


const WSEvent = new EventEmitter();

/**
 * Disabling WS
 */
// WSEvent.on('register', registerWS);
// WSEvent.on('unregister', unregisterWS);

function registerWS(inputs: string) {
    const payload = JSON.parse(inputs) as Record<string, string>;
    if (
        (payload.apiKey && typeof payload.apiKey === 'string') &&
        (payload.accessToken && typeof payload.accessToken === 'string')
    ) {
        const wsController = new WSController();
        wsController.initialize(payload.apiKey, payload.accessToken);
    }
}

function unregisterWS(apiKey: string) {
    if (apiKey && typeof apiKey === 'string') {
        const wsController = new WSController();
        wsController.uninitializeWS(apiKey);
    }
}

function wsTickerSubscription(apiKey: string, instruments: string[]) {
    

}

WSEvent.on('subscribe', wsTickerSubscription);

export default WSEvent;