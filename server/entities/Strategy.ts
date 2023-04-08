import { Entity, PrimaryColumn, Column } from "typeorm"



@Entity()
export default class Strategy {
    @PrimaryColumn()
    sid: string;
    
    @Column()
    name: string;

    @Column()
    description: string;

    constructor(sid: string, name: string, description: string) {
        this.sid = sid;
        this.name = name;
        this.description = description;
    }
}
