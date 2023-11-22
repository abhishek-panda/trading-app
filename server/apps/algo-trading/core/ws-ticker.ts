import logger from "../logger";
const KiteTicker = require("kiteconnect").KiteTicker;


export interface WSTicker {
    connect: () => void;
    disconnect: () => void;
    autoReconnect: (reconn: boolean, attempt: number, delay: number) => void;
    on: (key: string, fnArg: (_: any) => void) => void;
    subscribe: (items: Number[]) => void;
    unsubscribe: (items: Number[]) => void;
    setMode:(mode: 'full'| 'quote' | 'ltp', items: Number[]) => void;
}

interface WSTickerParams {
    api_key: string;
    access_token: string;
}

class KiteWSTicker {
    private ticker?: WSTicker;

    constructor(params: WSTickerParams) {
        const apiKey = params.api_key;
        this.ticker = new KiteTicker({
            api_key: params.api_key,
            access_token: params.access_token,
        }) as WSTicker;

        /**
         * Max allowed reconnection attempts is 300 and min delay in reconnection is 5
         * So after 25 minutes the application will die because the library has process.exit(1) after n retries
         * 
         * Note: Enabling reconnect will kill the process
         */
        this.ticker.autoReconnect(true, 300, 5);
        this.ticker.on('connect', function () {
            logger.info(`KiteWS with apiKey: ${apiKey} connected`);
        });
        this.ticker.on('disconnect', (error: Error) => {
            logger.error(`KiteWS with apiKey: ${apiKey} disconnected. ${error?.message ?? new Date()}.`);
        });
        this.ticker.on('error',  (error: Error) => {
            logger.error(`KiteWS with apiKey: ${apiKey} has connection error. ${error?.message ?? ''}`);
        });
        this.ticker.on('reconnect', () => {
            logger.info(`KiteWS with apiKey: ${apiKey} reconnecting...`);
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