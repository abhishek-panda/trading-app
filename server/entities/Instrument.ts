import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm"
import { TradingTimeFrame } from "../../libs/typings";

@Entity()
export default class Instrument {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @PrimaryColumn({ type: 'enum', enum: TradingTimeFrame })
    timeframe: TradingTimeFrame;

    @PrimaryColumn()
    sid: string;

    @PrimaryColumn()
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