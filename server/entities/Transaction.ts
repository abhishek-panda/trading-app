import { Entity, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Column, ManyToOne, JoinColumn } from "typeorm";
import { BOOLEAN, ORDER_STATUS } from "../../libs/typings";
import Subscription from "./Subscription";
import * as Typings from '../typings';


@Entity()
export default class Transaction {


    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ unique: true, nullable: false })
    orderId: string;

    @Column()
    transactionId: string;

    // Subscription Id
    @ManyToOne(() => Subscription, {
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE',
    })
    @JoinColumn([
        { name: 'id', referencedColumnName: 'id' },
        { name: 'brokerClientId', referencedColumnName: 'brokerClientId' },
        { name: 'strategyId', referencedColumnName: 'strategyId' },
    ])
    sid: Subscription;

    @Column()
    ticker: string;

    @Column()
    transactionType: Typings.TransactionType;

    @Column({ type: 'enum', enum: ORDER_STATUS, default: ORDER_STATUS.OPEN })
    orderStatus: ORDER_STATUS;

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


    constructor(orderId: string, sid: Subscription, transactionId: string, ticker: string, transactionType: Typings.TransactionType, quantity: number, entryprice: number, testMode: BOOLEAN) {
        this.orderId = orderId;
        this.sid = sid;
        this.transactionId = transactionId;
        this.ticker = ticker;
        this.transactionType = transactionType;
        this.quantity = quantity;
        this.entryprice = entryprice;
        this.testMode = testMode;
    }
}