import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BOOLEAN, } from "../../libs/typings";
import Subscription from "./Subscription";
import * as Typings from '../typings';


@Entity()
export default class Transaction {


    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false})
    tid: string;

    // Subscription Id
    @ManyToOne(() => Subscription, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([
        { name: 'brokerClientId', referencedColumnName: 'brokerClientId' },
        { name: 'strategyId', referencedColumnName: 'strategyId' },
        { name: 'timeframe', referencedColumnName: 'timeframe' },
    ])
    sid: Subscription;

    @Column()
    order: string;

    @Column()
    ticker: string;

    @Column()
    transactionType: Typings.TransactionType;

    @Column()
    quantity: number;

    @Column()
    entryprice: number;

    @Column({ nullable: true })
    exitprice: string;

    @Column({ type: 'enum', enum: BOOLEAN, default: BOOLEAN.TRUE })
    isActive: BOOLEAN;
    
    @Column({ type: 'enum', enum: BOOLEAN })
    testMode: BOOLEAN;

    @CreateDateColumn({ name: 'created_at' }) 
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;

    
    constructor(tid: string, sid: Subscription, order: string, ticker: string, transactionType: Typings.TransactionType, quantity: number, entryprice: number, testMode: BOOLEAN) {
        this.tid = tid;
        this.sid = sid;
        this.order= order;
        this.ticker = ticker;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.entryprice = entryprice;
        this.testMode = testMode;
    }
}