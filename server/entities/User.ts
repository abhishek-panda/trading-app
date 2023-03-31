import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from "typeorm"
import UserSession from "./UserSession";

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

    @OneToMany(() => UserSession, (userSession) => userSession.user)
    session: UserSession


    constructor(name: string, email: string, password: string) {
        this.name = name;
        this.email = email;
        this.password = password;
    }
}