import { Entity, Column, PrimaryColumn } from "typeorm"


@Entity()
export default class TradeSetup {
   
    @PrimaryColumn()
    sid: string;

    @Column()
    ceName: string;

    @Column()
    ceId: string;

    @Column()
    cePath: string;

    @Column()
    peName: string;

    @Column()
    peId: string;

    @Column()
    pePath: string;


    constructor(sid: string, ceName: string, ceId: string, cePath: string, peName: string, peId: string, pePath: string) {
        this.sid = sid;
        this.ceId = ceId;
        this.ceName = ceName;
        this.cePath = cePath;
        this.peId = peId;
        this.peName = peName;
        this.pePath = pePath;
    }
}