import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import Strategy from "./Strategy";

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

    constructor( strategy: Strategy, name: string, instrumentId: string, filePath: string ) {
        this.strategy = strategy;
        this.name = name;
        this.instrumentId = instrumentId;
        this.file = filePath;
    }

}