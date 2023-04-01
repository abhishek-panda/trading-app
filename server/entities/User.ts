import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import UserSession from "./UserSession";
import { BOOLEAN } from "../typings";

@Entity()
export default class User{
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column()
    name: string;

    @Column({unique : true})
    email: string;

    @Column()
    password: string;

    @Column()
    joinedOn: Date;

    @Column({ type: 'enum', enum: BOOLEAN, default: BOOLEAN.FALSE  })
    isEmailVerified: BOOLEAN;

    @OneToMany(() => UserSession, (userSession) => userSession.user)
    session: UserSession;


    constructor(name: string, email: string, password: string, joinedOn: Date) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.joinedOn = joinedOn;
    }
}