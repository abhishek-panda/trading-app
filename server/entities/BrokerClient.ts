import { Entity, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Column, OneToMany } from "typeorm"
import User from "./User";
import { BROKER, BOOLEAN } from "../../libs/typings";
import Subscription from "./Subscription";


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

    @Column()
    secret: string;

    @Column({ nullable: true })
    accessToken: string;


    @Column()
    userId: string;
    
    @ManyToOne(() => User, (user) => user.broker, { nullable : false})
    @JoinColumn({ name : 'userId'})
    user: User;

    @Column({ type: 'enum', enum: BOOLEAN, default:BOOLEAN.FALSE })
    isEnabled: BOOLEAN;

    @OneToMany(() => Subscription, (subscription) => subscription.brokerClient)
    subscription: Subscription[];

    constructor(cname: string, broker: BROKER, apiKey: string, secret: string, user: User) {
        this.cname = cname;
        this.broker = broker;
        this.apiKey = apiKey;
        this.secret = secret;
        this.user = user;
    }
}
