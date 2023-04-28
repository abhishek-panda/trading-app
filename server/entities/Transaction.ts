import { Entity, PrimaryGeneratedColumn, PrimaryColumn, OneToMany, JoinColumn, Column, ManyToOne } from "typeorm";
import Subscription from "./Subscription";
import { BOOLEAN, } from "../../libs/typings";
import * as Typings from '../typings';


@Entity()
export default class Transaction {

    @PrimaryGeneratedColumn("rowid")
    id: string;

    // Transaction Id
    @Column()
    tid: string;

    // Subscription Id
    @Column()
    sid: string; 

    @Column()
    ticker: string;

    @Column()
    transactionType: Typings.TransactionType;


    
    
    @Column({ type: 'enum', enum: BOOLEAN })
    testMode: BOOLEAN;


    

    

    // constructor() {
    //     // this.subscription = subscription;
    // }
}