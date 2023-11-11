import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import Subscription from "./Subscription";
import { TradingTimeFrame } from "../../libs/typings";
import StrategyLeg from "./StrategyLeg";

@Entity()
export default class Strategy {
    @PrimaryColumn()
    sid: string;
    
    @Column()
    name: string;

    @Column()
    description: string;

    @Column({ type: 'enum', enum: TradingTimeFrame })
    timeframe: TradingTimeFrame;

    @OneToMany(() => Subscription, (subscription) => subscription.strategy)
    subscription: Subscription[];

    @OneToMany(() => StrategyLeg, (strategyLeg) => strategyLeg.strategy)
    strategyLeg: StrategyLeg[];

    constructor(sid: string, name: string, timeframe: TradingTimeFrame ,description: string) {
        this.sid = sid;
        this.name = name;
        this.timeframe = timeframe;
        this.description = description;
    }
}
