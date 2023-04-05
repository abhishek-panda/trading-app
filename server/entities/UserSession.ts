import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from "typeorm"
import User from "./User";



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

    constructor(sessionId: string, user: User, createdOn: Date, expiredOn: Date) {
        this.id = sessionId;
        this.user = user;
        this.createdOn = createdOn;
        this.expiredOn = expiredOn;
    }
}
