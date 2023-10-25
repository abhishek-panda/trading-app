import BrokerClientModel from "../../trading-app/models/brokerClientModel";
import KiteWSTicker, {WSTicker} from "../core/ws-ticker";
import { cache } from '../../../utils';
import TransactionController from "../controllers/transactionController";
import { ORDER_STATUS } from "../../../../libs/typings";
import logger from "../logger";

class WSModel {

    private wsInstances: Map<string, WSTicker|undefined> = new Map();

    constructor() { }

    initializeWS(api_key: string, access_token: string) {
        const kiteTicker = new KiteWSTicker({ api_key, access_token });
        const tickerInstance = kiteTicker.getInstance();
        this.wsInstances.set(api_key, tickerInstance);
        
        tickerInstance?.on('connect', function () {
            cache.set(`WS_${api_key}`, tickerInstance);
            console.log(`WS_${api_key}`);
            const items = [17225730];
            tickerInstance.subscribe(items);
            tickerInstance.setMode("full", items);
        });
        tickerInstance?.on('disconnect', function () {
            cache.del(`WS_${api_key}`);
        });
        tickerInstance?.on('close', function () {
            cache.del(`WS_${api_key}`);
        });
        tickerInstance?.on('order_update', function (orderDetail = {}) {
            // const { order_id = '', status = ORDER_STATUS.OPEN } = orderDetail;
            // if (order_id && status !== ORDER_STATUS.OPEN) {
            //     // TODO: Verify if all orders are updating
            //     logger.info(`Updating order status. ${JSON.stringify(orderDetail)}`);
            //     const tradeController = new TransactionController();
            //     tradeController.update(order_id, orderDetail);
            // }
        });
        tickerInstance?.on('ticks', function(ticks)  {
            logger.info(`Ticks :  ${JSON.stringify(ticks)}`)
        })
        kiteTicker.connect();
    }

    

    async initializeAll() {
        const brokerClientModel = new BrokerClientModel();
        const clients = await brokerClientModel.getAllActiveClients();
        clients.forEach(client => {
            // TODO: Check if intializing WS is async
            this.initializeWS(client.apiKey, client.accessToken);
        });
    }

    subscribe() {

    }

    getTicker(apiKey: string) {
        return this.wsInstances.get(apiKey);
    }

    getAllTickers() {
        return this.wsInstances;
    }

    uninitializeWS(api_key: string) {
        cache.del(`WS_${api_key}`);
    }
}


export default new WSModel();