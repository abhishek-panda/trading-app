import { Entity, PrimaryColumn, CreateDateColumn, ManyToOne, JoinColumn, Column } from "typeorm"
import User from "./User";
import { SESSION_STATE } from "../typings";



@Entity()
export default class UserSession {
    @PrimaryColumn()
    id!: string;
    
    @ManyToOne(() => User, (user) => user.session, { nullable : false})
    @JoinColumn({ name : 'userId'})
    user: User;

    @CreateDateColumn()
    createdDate!: Date;

    @Column({ type: 'enum', enum: SESSION_STATE, default: SESSION_STATE.VALID })
    isValid!: SESSION_STATE;

    constructor(sessionId: string, user: User) {
        this.id = sessionId;
        this.user = user;
    }
}
