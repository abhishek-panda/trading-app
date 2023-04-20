function strategyResolver(strategyId: string) {

}

export default strategyResolver;

 // const tickerName = Utils.TICKER[signal.ticker];
        // if (process.env.ACCESS_TOKEN && tickerName !== undefined) {
        //     const currentTicker = `${Typings.Exchange.NSE}:${tickerName}`; // "NSE:NIFTY 50"
        //     const currentTickerQuote = await Kite.getQuote([currentTicker]);
        //     if (!(currentTickerQuote instanceof Error) && currentTickerQuote[currentTicker]) {
        //         const currentTickerLastPrice = currentTickerQuote[currentTicker].last_price ?? 0;
        //         if (currentTickerLastPrice > 0) {
        //             const strategyOrder = await Strategies.followTrendStrategy(signal, currentTickerLastPrice);
        //             if (strategyOrder) {
        //                 const orderPromises: Promise<string>[] = [];
        //                 strategyOrder.orders.forEach(order => {
        //                     const orderPromise = Kite.placeOrder("regular", order);
        //                     orderPromises.push(orderPromise);
        //                 });
        //                 Promise.all(orderPromises).then(orderIds => {
        //                     const stringifiedOrderIds =  orderIds.join(',');
        //                     logger.info(`${strategyOrder.transaction} orders Placed : ${stringifiedOrderIds}`)
        //                 }).catch(err => {
        //                     console.log(err);
        //                 })
        //             }
        //         }
        //     }
        // }