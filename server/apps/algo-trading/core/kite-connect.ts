const Kite = require('kiteconnect');
import logger from '../logger';
import { BasketOrderItem } from '../../../typings';


/**
 * TODO: Add return type of member function
 */
export default class KiteConnect {

    private kiteconnect: any;

    constructor(apiKey: string) {
        const options = {
            api_key: apiKey,
            debug: false
        }
        this.kiteconnect = new Kite.KiteConnect(options)
    }

    getAccessToken(request_token: string, secret: string): Promise<string | Error> {
        return this.kiteconnect.generateSession(request_token, secret)
            .then(function (response: any) {
                logger.info("Token successfully generated");
                return response.access_token;
            })
            .catch(function (error: any) {
                const errorDetails = new Error(`Failed to generate access token. ${JSON.stringify(error)}`);
                logger.error(errorDetails.message);
                return errorDetails;
            });
    }

    getProfile(accessToken: string) {
        this.kiteconnect.setAccessToken(accessToken);
        return this.kiteconnect.getProfile()
            .then(function (response: any) {
                return response;
            }).catch(function (error: any) {
                const errorDetails = new Error(`Failed to get user profile. ${JSON.stringify(error)}`);
                logger.error(errorDetails.message);
                return errorDetails;
            });
    }


    getMargin(accessToken: string, segment = "equity") {
        this.kiteconnect.setAccessToken(accessToken);
        return this.kiteconnect.getMargins(segment)
            .then(function (response: any) {
                return response;
            }).catch(function (error: any) {
                const errorDetails = new Error(`Failed to get margin details. ${JSON.stringify(error)}`);
                logger.error(errorDetails.message);
                return errorDetails;
            });
    }

    getInstruments(accessToken: string, exchange = 'NSE') {
        this.kiteconnect.setAccessToken(accessToken);
        return this.kiteconnect.getInstruments(exchange).then(function (response: any) {
            return response;
        }).catch(function (error: any) {
            const errorDetails = new Error(`Failed to get all instruments. ${JSON.stringify(error)}`);
            logger.error(errorDetails.message);
            return errorDetails;
        })
    }


    getQuote(accessToken: string, instruments: string[] = []) {
        this.kiteconnect.setAccessToken(accessToken);
        return this.kiteconnect.getQuote(instruments).then(function (response: any) {
            return response;
        }).catch(function (error: any) {
            const errorDetails = new Error(`Failed to get quote. ${JSON.stringify(error)}`);
            logger.error(errorDetails.message);
            return errorDetails;
        })
    }

    getBasketMargin(accessToken: string, basketOrders: BasketOrderItem[] = []) {
        this.kiteconnect.setAccessToken(accessToken);
        return this.kiteconnect.orderBasketMargins(basketOrders, true, "compact").then(function (response: any) {
            return response;
        }).catch(function (error: any) {
            const errorDetails = new Error(`Failed to get basket margin. ${JSON.stringify(error)}`);
            logger.error(errorDetails.message);
            return errorDetails;
        });
    }

    /*
    * TODO: To check if basket order can be placed instead of single order
    *  To verify the parameters.
    */
    placeOrder(accessToken: string, variety: string, order: BasketOrderItem): Promise<string | Error> {
        this.kiteconnect.setAccessToken(accessToken);
        logger.info(`Placing order. ${JSON.stringify(order)}`);
        return this.kiteconnect.placeOrder(variety, order).then(function (response: any) {
            return response.order_id;
        }).catch(function (error: any) {
            const errorDetails = new Error(`Failed to place order. Order : ${JSON.stringify(order)}. Error: ${JSON.stringify(error)}`);
            logger.error(errorDetails.message);
            return errorDetails;
        });
    }
}