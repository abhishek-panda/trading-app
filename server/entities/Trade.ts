import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, PrimaryColumn } from "typeorm"
import Subscription from "./Subscription";
import { TradingTimeFrame } from "../../libs/typings";

@Entity()
export default class Trade {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn({ type: 'enum', enum: TradingTimeFrame })
    timeframe: TradingTimeFrame;

    @PrimaryColumn()
    sid: string;

    @Column()
    name: string;

    @Column()
    filename: string;

    constructor(timeframe: TradingTimeFrame, sid: string, name: string, filename: string) {
        this.timeframe = timeframe;
        this.sid = sid;
        this.name = name;
        this.filename = filename;
    }
}