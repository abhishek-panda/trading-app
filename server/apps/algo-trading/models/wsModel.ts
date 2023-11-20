import KiteWSTicker, {WSTicker} from "../core/ws-ticker";
import { cache } from '../../../utils';
import TransactionController from "../controllers/transactionController";
import { ORDER_STATUS } from "../../../../libs/typings";
import WebSocketEvent, { WSEvents } from "../events/ws";
import logger from "../logger";

interface WSInstanceDetails {
    instance: WSTicker;
    subscribedInstruments: number[];
}

class WSModel {

    private wsInstances: Map<string, WSInstanceDetails> = new Map();

    constructor() { }

    initializeWS(api_key: string, access_token: string) {
        const existingWS = this.getWSInstanceDetails(api_key);
        if (existingWS) {
            logger.info("Socket already exists. Clearing...");
            existingWS.instance.disconnect();
            existingWS.subscribedInstruments = [];
        }
        const kiteTicker = new KiteWSTicker({ api_key, access_token });
        const tickerInstance = kiteTicker.getInstance();
        if (tickerInstance) {
            this.wsInstances.set(api_key, {instance: tickerInstance, subscribedInstruments : []});
            tickerInstance.on('ticks', function(ticks)  {
                WebSocketEvent.emit(WSEvents.STREAM_TICKS, ticks);
            });
            tickerInstance?.on('order_update', function (orderDetail) {
                logger.info(`Order status : ${JSON.stringify(orderDetail)}`);
                WebSocketEvent.emit(WSEvents.ORDER_UPDATE, orderDetail);
            });
        }
        
        
        kiteTicker.connect();
    }

    private getWSInstanceDetails(apiKey: string) {
        return this.wsInstances.get(apiKey);
    }

    subscribe(apiKey: string, instrument: number[]) {
        const wsInstanceDetails = this.getWSInstanceDetails(apiKey);
        const ws = wsInstanceDetails?.instance;
        if (ws) {
            const tempSubscribedInstruments = [... wsInstanceDetails.subscribedInstruments];
            this.unsubscribeAll(apiKey);
            wsInstanceDetails.subscribedInstruments =  Array.from(new Set(tempSubscribedInstruments.concat(instrument)));
            ws.subscribe(wsInstanceDetails.subscribedInstruments);
            ws.setMode("full",  wsInstanceDetails.subscribedInstruments);
        }
    }

    unsubscribe(apiKey: string, instrument: number[]) {
        const wsInstanceDetails = this.getWSInstanceDetails(apiKey);
        const ws = wsInstanceDetails?.instance;
        if (ws) {
            wsInstanceDetails.subscribedInstruments = wsInstanceDetails.subscribedInstruments.filter(function (ins) {
                return !instrument.includes(ins);
            });
            ws.unsubscribe(instrument);
        }
    }

    unsubscribeAll(apiKey: string) {
        const wsInstanceDetails = this.getWSInstanceDetails(apiKey);
        const ws = wsInstanceDetails?.instance;
        if (ws) {
            ws.unsubscribe(wsInstanceDetails.subscribedInstruments);
            wsInstanceDetails.subscribedInstruments = [];
        }
    }

    uninitializeWS(api_key: string) {
        cache.del(`WS_${api_key}`);
    }
}


export default new WSModel();