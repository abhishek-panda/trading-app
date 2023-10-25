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
    file: string;

    constructor(timeframe: TradingTimeFrame, sid: string, name: string, filePath: string) {
        this.timeframe = timeframe;
        this.sid = sid;
        this.name = name;
        this.file = filePath;
    }
}