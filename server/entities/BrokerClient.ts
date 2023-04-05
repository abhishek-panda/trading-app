import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column } from "typeorm"
import User from "./User";
import { BROKER, BOOLEAN } from "../../libs/typings";



@Entity()
export default class BrokerClient {
    @PrimaryGeneratedColumn("uuid")
    id: string;
    
    @Column()
    cname: string;

    @Column({ type: 'enum', enum: BROKER })
    broker: BROKER;

    @Column()
    apiKey: string;

    @ManyToOne(() => User, (user) => user.broker, { nullable : false})
    @JoinColumn({ name : 'userId'})
    user: User;

    @Column({ type: 'enum', enum: BOOLEAN, default:BOOLEAN.FALSE })
    isActive: BOOLEAN;

    constructor(cname: string, broker: BROKER, apiKey: string, user: User) {
        this.cname = cname;
        this.broker = broker;
        this.apiKey = apiKey;
        this.user = user;
    }
}
