import { Entity, Column, PrimaryGeneratedColumn, PrimaryColumn } from "typeorm"
import { BOOLEAN, TradingTimeFrame } from "../../libs/typings";

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

    @Column()
    iId: string;

    @Column({ type: 'enum', enum: BOOLEAN, default:BOOLEAN.FALSE })
    connected: BOOLEAN;

    constructor(timeframe: TradingTimeFrame, sid: string, name: string, filePath: string, instrumentId: string) {
        this.timeframe = timeframe;
        this.sid = sid;
        this.name = name;
        this.file = filePath;
        this.iId = instrumentId;
    }
}