import EventEmitter from 'events';
import WSController from '../../algo-trading/controllers/wsController';


const WSEvent = new EventEmitter();

/**
 * Disabling WS
 */
WSEvent.on('register', registerWS);
WSEvent.on('unregister', unregisterWS);
WSEvent.on('subscribe-instrument', subscribeInstrument);

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

function subscribeInstrument(inputs: string) {
    const payload = JSON.parse(inputs) as Record<string, string>;
    if (
        (payload.apiKey && typeof payload.apiKey === 'string') && 
        Array.isArray(payload.instrument) 
    ) {
        const wsController = new WSController();
        const ws = wsController.getWS(payload.apiKey);
        ws?.on('ticks', function(ticks)  {
            // TODO: Consume the streaming service
            console.log(JSON.stringify(ticks));
        });
        const instrument = payload.instrument.map(ins => parseInt(ins));
        ws?.subscribe(instrument);
        ws?.setMode("full", instrument);
    }

}



export default WSEvent;