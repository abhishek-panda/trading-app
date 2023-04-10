import { Entity, PrimaryColumn, Column, OneToMany } from "typeorm"
import Subscription from "./Subscription";


@Entity()
export default class Strategy {
    @PrimaryColumn()
    sid: string;
    
    @Column()
    name: string;

    @Column()
    description: string;

    @OneToMany(() => Subscription, (subscription) => subscription.strategy)
    subscription: Subscription[];

    constructor(sid: string, name: string, description: string) {
        this.sid = sid;
        this.name = name;
        this.description = description;
    }
}
