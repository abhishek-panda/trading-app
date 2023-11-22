import EventEmitter from 'events';
import WSController from '../../algo-trading/controllers/wsController';
import RabbitMQEvent, { RBMQEvents } from './rabbit';
import { wstradeLogger } from '../logger';


export enum WSEvents {
    REGISTER = 'REGISTER',
    UNREGISTER = 'UNREGISTER',
    SUBSCRIBE_INSTRUMENT = 'SUBSCRIBE_INSTRUMENT',
    STREAM_TICKS = 'STREAM_TICKS',
    ORDER_UPDATE = 'ORDER_UPDATE',
}


const WebSocketEvent = new EventEmitter();

/**
 * Disabling WS
 */
WebSocketEvent.on(WSEvents.REGISTER, registerWS);
WebSocketEvent.on(WSEvents.UNREGISTER, unregisterWS);
WebSocketEvent.on(WSEvents.SUBSCRIBE_INSTRUMENT, subscribeInstrument);
WebSocketEvent.on(WSEvents.STREAM_TICKS, streamTickData);
WebSocketEvent.on(WSEvents.ORDER_UPDATE, orderUpdate);

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

function subscribeInstrument(payload: Record<string, unknown>) {
    if (
        (payload.apiKey && typeof payload.apiKey === 'string') && 
        Array.isArray(payload.instrument) 
    ) {
        const wsController = new WSController();
        const instrument = payload.instrument.map(ins => parseInt(ins));
        wsController.subscribe(payload.apiKey, instrument);
    }
}


function streamTickData(data: string) {
    RabbitMQEvent.emit(RBMQEvents.STREAM_WS_TICKS, data);
}


function orderUpdate(data: unknown) {
    wstradeLogger.info(`Trade : ${JSON.stringify(data)}`)
}


export default WebSocketEvent;