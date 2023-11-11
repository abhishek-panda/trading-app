import KiteWSTicker, {WSTicker} from "../core/ws-ticker";
import { cache } from '../../../utils';
import TransactionController from "../controllers/transactionController";
import { ORDER_STATUS } from "../../../../libs/typings";
import WebSocketEvent, { WSEvents } from "../events/ws";

class WSModel {

    private wsInstances: Map<string, WSTicker|undefined> = new Map();

    constructor() { }

    initializeWS(api_key: string, access_token: string) {
        const existingWS = this.getWS(api_key);
        if (existingWS) {
            existingWS.disconnect();
        }
        const kiteTicker = new KiteWSTicker({ api_key, access_token });
        const tickerInstance = kiteTicker.getInstance();
        this.wsInstances.set(api_key, tickerInstance);
        // tickerInstance?.on('order_update', function (orderDetail = {}) {
        //     const { order_id = '', status = ORDER_STATUS.OPEN } = orderDetail;
        //     if (order_id && status !== ORDER_STATUS.OPEN) {
        //         // TODO: Verify if all orders are updating
        //         logger.info(`Updating order status. ${JSON.stringify(orderDetail)}`);
        //         const tradeController = new TransactionController();
        //         tradeController.update(order_id, orderDetail);
        //     }
        // });
        kiteTicker.connect();
    }

    private getWS(apiKey: string) {
        return this.wsInstances.get(apiKey);
    }

    subscribe(apiKey: string, instrument: number[]) {
        const ws = this.getWS(apiKey);
        if (ws) {
            ws.on('ticks', function(ticks)  {
                WebSocketEvent.emit(WSEvents.STREAM_TICKS, ticks);
            });
            ws.subscribe(instrument);
            ws.setMode("full", instrument);
        }
    }

    unsubscribe(apiKey: string, instrument: number[]) {
        const ws = this.getWS(apiKey);
        if (ws) {
            ws.unsubscribe(instrument);
        }
    }

    uninitializeWS(api_key: string) {
        cache.del(`WS_${api_key}`);
    }
}


export default new WSModel();