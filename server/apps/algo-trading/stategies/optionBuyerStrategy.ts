import { DataSource } from 'typeorm';
import { InstrumentTA, STRATEGY } from '../../../../libs/typings';
import DBConn from '../../../dbConn';
import StrategyLeg from '../../../entities/StrategyLeg';
import { wsTickLogger } from '../logger';


enum POSITION_STATUS {
    NONE = "NONE",
    HOLD = "HOLD"
}

interface StrategyLegDetail {
    status: POSITION_STATUS,
    strategyLeg: StrategyLeg
}

export default class OptionBuyerStrategy {
    private dataSource: DataSource;
    private strategyId: string = STRATEGY.OPTION_BUYER;
    private subscribedInstruments: Map<number, StrategyLegDetail> = new Map();
    private postionStatus: POSITION_STATUS = POSITION_STATUS.NONE;

    constructor() {
        this.dataSource = DBConn.getInstance();
        this.init();
    }

    private async init() {
        const subscribedInstruments = await this.dataSource.getRepository(StrategyLeg).findBy({ strategyId: this.strategyId });
        // Preprocessing
        if (subscribedInstruments.length) {
            this.subscribedInstruments = subscribedInstruments.reduce((accumulator, leg) => {
                const id = parseInt(leg.instrumentId);
                accumulator.set(id, {status: POSITION_STATUS.NONE, strategyLeg:leg});
                return accumulator;
            }, this.subscribedInstruments);
        }
    }
    
    watch (instrumentData: InstrumentTA) {
        const { instrument, candles } = instrumentData;
        const instrumentDetails = this.subscribedInstruments.get(instrument);
        if (instrumentDetails && candles.length > 0) {
            const {status, strategyLeg: {name: instrumentName}} = instrumentDetails;
            const { close, ema5, ema9, ema20 } = candles[0];
            
            // Upside Move
            if (ema5 > ema20 && ema9 > ema20) {
                
                // Buy CE or PE if nothing is bought yet  
                if(status === POSITION_STATUS.NONE) {
                    wsTickLogger.info(`Trade: ${instrumentName} buy at ${close}`);
                    instrumentDetails.status = POSITION_STATUS.HOLD;
                }

            }

            // Downside move
            if (ema5 < ema9 && ema9 < ema20) {
               
                // Exit if holding any CE or PE postion
                if (status === POSITION_STATUS.HOLD) {
                    wsTickLogger.info(`Trade: ${instrumentName} sell at ${close}`);
                    instrumentDetails.status = POSITION_STATUS.NONE;
                }
            }
        }
    }
};

