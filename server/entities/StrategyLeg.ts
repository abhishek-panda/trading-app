import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Strategy from "./Strategy";
import { BOOLEAN } from "../../libs/typings";

@Entity()
export default class StrategyLeg {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    strategyId: string;

    @ManyToOne(() => Strategy, (strategy) => strategy.strategyLeg, { nullable : false})
    @JoinColumn({ name : 'strategyId'})
    strategy: Strategy;

    @Column()
    name: string;

    @Column()
    instrumentId: string;

    @Column()
    file: string;

    @Column({ type: 'enum', enum: BOOLEAN, default: BOOLEAN.FALSE })
    isHedge: BOOLEAN;

    constructor( strategy: Strategy, name: string, instrumentId: string, filePath: string, isHedge: BOOLEAN = BOOLEAN.FALSE ) {
        this.strategy = strategy;
        this.name = name;
        this.instrumentId = instrumentId;
        this.file = filePath;
        this.isHedge = isHedge;
    }

}