import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { TradingTimeFrame, BOOLEAN } from "../../libs/typings";
import Strategy from "./Strategy";
import BrokerClient from "./BrokerClient";


@Entity()
export default class Subscription {
    
    @PrimaryColumn()
    brokerClientId: string;

    @PrimaryColumn()
    strategyId: string;

    @PrimaryColumn({ type: 'enum', enum: TradingTimeFrame })
    timeframe: TradingTimeFrame;

    @ManyToOne(() => BrokerClient, (brokerClient) => brokerClient.subscription)
    @JoinColumn({ name: 'brokerClientId' })
    brokerClient: BrokerClient;

    @ManyToOne(() => Strategy, (strategy) => strategy.subscription)
    @JoinColumn({ name: 'strategyId' })
    strategy: Strategy;

    @Column()
    name: string;

    @Column()
    subscribedOn: Date;

    @Column({ type: 'enum', enum: BOOLEAN, default: BOOLEAN.TRUE })
    isActive: BOOLEAN;

    @Column({ type: 'enum', enum: BOOLEAN, default: BOOLEAN.TRUE })
    testMode: BOOLEAN;

    constructor(brokerClientId: string, strategyId: string, timeframe: TradingTimeFrame, name: string, subscribedOn: Date) {
        this.brokerClientId = brokerClientId;
        this.strategyId = strategyId;
        this.timeframe = timeframe;
        this.name = name;
        this.subscribedOn = subscribedOn;
    }
}