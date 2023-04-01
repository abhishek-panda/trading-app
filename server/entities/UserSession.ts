import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from "typeorm"
import User from "./User";
import { BOOLEAN } from "../typings";



@Entity()
export default class UserSession {
    @PrimaryColumn()
    id: string;
    
    @ManyToOne(() => User, (user) => user.session, { nullable : false})
    @JoinColumn({ name : 'userId'})
    user: User;

    @Column()
    createdOn: Date;

    @Column()
    expiredOn: Date;

    @Column({ type: 'enum', enum: BOOLEAN, default: BOOLEAN.TRUE })
    isValid!: BOOLEAN;

    constructor(sessionId: string, user: User, createdOn: Date, expiredOn: Date) {
        this.id = sessionId;
        this.user = user;
        this.createdOn = createdOn;
        this.expiredOn = expiredOn;
    }
}
