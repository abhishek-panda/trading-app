const Kite = require('kiteconnect');
import logger from '../logger';

export default class KiteConnectModel {

    private kiteconnect: any;

    constructor(apiKey: string) {
        const options = {
            api_key: apiKey,
            debug: false
        }
        this.kiteconnect = new Kite.KiteConnect(options)
    }

    getAccessToken (request_token: string, secret: string): Promise<string|Error> {
        return this.kiteconnect.generateSession(request_token, secret)
            .then(function(response: any) {
                logger.info("Token successfully generated");
                return response.access_token;
            })
            .catch(function(error: any) {
                logger.error(`Failed to generate access token. ${JSON.stringify(error)}`);
                return new Error("Failed to generate access token");
            });
    }

    getProfile (accessToken: string) {
        this.kiteconnect.setAccessToken(accessToken);
        return this.kiteconnect.getProfile()
            .then(function(response: any) {
               return response;
            }).catch(function(error: any) {
                logger.error(`Failed to get user profile. ${JSON.stringify(error)}`);
                return new Error("Failed to get user profile");
            });
    }


}





// function getMargin (segment = "equity") {
//     const kiteConnection = connectKite();
//     kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
//     return kiteConnection.getMargins(segment)
// 		.then(function(response: any) {
// 			return response;
// 		}).catch(function(error: any) {
//             logger.error(`Failed to get margin details. ${JSON.stringify(error)}`);
//             return '';
// 		});
// }

// function getInstruments(exchange =  'NSE') {
//     const kiteConnection = connectKite();
//     kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
// 	return kiteConnection.getInstruments(exchange).then(function(response: any) {
//             return response;
//         }).catch(function(error: any) {
//             logger.error(`Failed to get all instruments. ${JSON.stringify(error)}`);
//             return '';
//         })
// }

// function getQuote(instruments = []) {
//     const kiteConnection = connectKite();
//     kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
// 	return kiteConnection.getQuote(instruments).then(function(response: any) {
//             return response;
//         }).catch(function(error: any) {
//             logger.error(`Failed to get quote. ${JSON.stringify(error)}`);
//             return new Error('Failed to get quote');
//         })
// }

// function getBasketMargin(basketOrders = []) {
//     const kiteConnection = connectKite();
//     kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
//     return kiteConnection.orderBasketMargins(basketOrders, true, "compact").then(function (response: any) {
//             return response;
//         }).catch(function(error: any) {
//             logger.error(`Failed to get basket margin. ${JSON.stringify(error)}`);
//             return new Error('Failed to get basket margin');
//         });
// }

// function placeOrder(variety: any, order: any) {
//     const kiteConnection = connectKite();
//     kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
//     logger.info(`Placing order. ${JSON.stringify(order)}`);
//     return kiteConnection.placeOrder(variety, order).then(function(response: any) {
// 			return response.order_id;
// 		}).catch(function(error: any) {
//             logger.error(`Failed to place order. Order : ${JSON.stringify(order)}. Error: ${JSON.stringify(error)}`);
//             return new Error('Failed to place order');
// 		});
// }



// module.exports = {
//     getAccessToken,
//     getProfile,
//     getMargin,
//     getInstruments,
//     getQuote,
//     getBasketMargin,
//     placeOrder
// };
// ticker.on('order_update', onTrade);