import BrokerClientModel from "../../trading-app/models/brokerClientModel";
import KiteWSTicker from "../core/ws-ticker";
import { cache } from '../../../utils';
import TransactionController from "../controllers/transactionController";
import { ORDER_STATUS } from "../../../../libs/typings";

export default class WSModel {

    constructor() { }

    initializeWS(api_key: string, access_token: string) {
        const kiteTicker = new KiteWSTicker({ api_key, access_token });
        const tickerInstance = kiteTicker.getInstance();
        tickerInstance?.on('connect', function () {
            cache.set(`WS_${api_key}`, tickerInstance);
        });
        tickerInstance?.on('disconnect', function () {
            cache.del(`WS_${api_key}`);
        });
        tickerInstance?.on('close', function () {
            cache.del(`WS_${api_key}`);
        });
        tickerInstance?.on('order_update', function (orderDetail) {
            const order_id = orderDetail.order_id;
            if (order_id) {
                const transactionData: Record<string, any> | undefined = cache.get(`OID_${order_id}`);
                if (transactionData && transactionData.orderId === order_id && orderDetail.status !== ORDER_STATUS.OPEN) {
                    console.log("orderDetail", orderDetail)
                    const { transactionId, subscription, order } = transactionData;
                    const tradeController = new TransactionController();
                    tradeController.update(order_id, orderDetail);
                    cache.del(`OID_${order_id}`);
                }
            }
        });
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

    uninitializeWS(api_key: string) {
        cache.del(`WS_${api_key}`);
    }
}