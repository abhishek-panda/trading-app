const Kite = require('kiteconnect');
const logger = require('./logger');

function connectKite() {
    const options = {
        api_key:  process.env.API_KEY,
        debug: false
    };
    return new Kite.KiteConnect(options);
}


function getAccessToken (request_token) {
    const kiteConnection = connectKite();
    const secret = process.env.API_SECRET;
    return kiteConnection.generateSession(request_token, secret)
		.then(function(response) {
            logger.info("Login successful");
			return response.access_token;
		})
		.catch(function(error) {
            logger.error(`Login failed. ${JSON.stringify(error)}`);
            return new Error("Login failed");
		});
}


function getProfile () {
    const kiteConnection = connectKite();
    kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
    return kiteConnection.getProfile()
        .then(function(response) {
           return response;
        }).catch(function(error) {
            logger.error(`Failed to get user profile. ${JSON.stringify(error)}`);
            return new Error("Failed to get user profile");
        });
}


function getMargin (segment = "equity") {
    const kiteConnection = connectKite();
    kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
    return kiteConnection.getMargins(segment)
		.then(function(response) {
			return response;
		}).catch(function(error) {
            logger.error(`Failed to get margin details. ${JSON.stringify(error)}`);
            return '';
		});
}

function getInstruments(exchange =  'NSE') {
    const kiteConnection = connectKite();
    kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
	return kiteConnection.getInstruments(exchange).then(function(response) {
            return response;
        }).catch(function(error) {
            logger.error(`Failed to get all instruments. ${JSON.stringify(error)}`);
            return '';
        })
}

function getQuote(instruments = []) {
    const kiteConnection = connectKite();
    kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
	return kiteConnection.getQuote(instruments).then(function(response) {
            return response;
        }).catch(function(error) {
            logger.error(`Failed to get quote. ${JSON.stringify(error)}`);
            return new Error('Failed to get quote');
        })
}

function getBasketMargin(basketOrders = []) {
    const kiteConnection = connectKite();
    kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
    return kiteConnection.orderBasketMargins(basketOrders, true, "compact").then(function (response) {
            return response;
        }).catch(function(error) {
            logger.error(`Failed to get basket margin. ${JSON.stringify(error)}`);
            return new Error('Failed to get basket margin');
        });
}

function placeOrder(variety, order) {
    const kiteConnection = connectKite();
    kiteConnection.setAccessToken(process.env.ACCESS_TOKEN);
    logger.info(`Placing order. ${JSON.stringify(order)}`);
    return kiteConnection.placeOrder(variety, order).then(function(response) {
			return response.order_id;
		}).catch(function(error) {
            logger.error(`Failed to place order. Order : ${JSON.stringify(order)}. Error: ${JSON.stringify(error)}`);
            return new Error('Failed to place order');
		});
}



module.exports = {
    getAccessToken,
    getProfile,
    getMargin,
    getInstruments,
    getQuote,
    getBasketMargin,
    placeOrder
};
// ticker.on('order_update', onTrade);