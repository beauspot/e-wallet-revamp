import { v4 as uuidv4 } from "uuid";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BeforeInsert,
    JoinColumn,
    OneToOne,
} from "typeorm";
import { User } from "@/db/user.entity";

@Entity()
export class SettlementAcct {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", length: 10, nullable: false }) // Keep varchar for PostgreSQL
    accountNumber: string; // Change type to string to match varchar

    @Column({ type: "varchar", nullable: false })
    accountName: string;

    @Column({ type: "boolean", nullable: false, default: false })
    default: boolean;

    @OneToOne(() => User, (user) => user.settlementAcct)
    @JoinColumn()
    userAcct: User;

    @BeforeInsert()
    generateId() {
        this.id = `SettleAcctID-${uuidv4()}`;
    }

    @CreateDateColumn()
    createdAt: Date;
}
