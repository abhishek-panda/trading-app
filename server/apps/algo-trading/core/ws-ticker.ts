import logger from "../logger";
const KiteTicker = require("kiteconnect").KiteTicker;


export interface WSTicker {
    connect: () => void;
    disconnect: () => void;
    autoReconnect: (reconn: boolean, attempt: number, delay: number) => void;
    on: (key: string, fnArg: (_: any) => void) => void;
    subscribe: (items: Number[]) => void;
    setMode:(mode: 'full'| 'quote' | 'ltp', items: Number[]) => void;
}

interface WSTickerParams {
    api_key: string;
    access_token: string;
}

class KiteWSTicker {
    private ticker?: WSTicker;

    constructor(params: WSTickerParams) {
        this.ticker = new KiteTicker({
            api_key: params.api_key,
            access_token: params.access_token,
        }) as WSTicker;

        this.ticker.autoReconnect(true, 20, 5);
        this.ticker.on('connect', function () {
            logger.info("KiteTicker WS connected");
        });
        this.ticker.on('disconnect', (error: Error) => {
            logger.error(`KiteTicker WS connection disconnected. ${error?.message ?? new Date()}.`);
        });
        this.ticker.on('error',  (error: Error) => {
            logger.error(`KiteTicker WS connection error. ${error?.message ?? ''}`);
        });
        this.ticker.on('order_update', function(order: any) {
            logger.info(`Order status : ${JSON.stringify(order)}`);
        });
    }

    public connect () {
        this.ticker?.connect();
    }

    public disconnect () {
        this.ticker?.disconnect();
    }

    public getInstance() {
        return this.ticker;
    }
}

export default KiteWSTicker;