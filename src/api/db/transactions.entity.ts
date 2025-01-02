import { v4 as uuidv4 } from "uuid";
import {
    Entity,
    Column,
    PrimaryGeneratedColumn,
    CreateDateColumn,
    BeforeInsert,
    BeforeUpdate,
    AfterInsert,
    AfterUpdate,
    BaseEntity,
    ManyToOne,
    JoinColumn
} from "typeorm";
import logging from "@/utils/logging";
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import { TransactionStatus, TransactionType, PaymentType } from "@/enum/transactions.enum";

@Entity()
export class UserTransactionModel extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({ type: "varchar", nullable: false })
    reference: string;

    @Column({ type: "varchar", nullable: false })
    gatewayReference: string;

    @Column({ nullable: false, type: "enum", enum: TransactionType, default: TransactionType.Debit })
    transactionType: TransactionType;

    @Column("decimal", { precision: 10, scale: 2, default: 0 })
    amount: number;

    @Column({ type: "varchar", default: "₦" })
    currency: string;

    @Column({ type: "varchar", nullable: true })
    recipient: string;

    @Column({ nullable: false, type: "enum", enum: TransactionStatus, default: TransactionStatus.Pending })
    status: TransactionStatus;

    @Column({ nullable: false, type: "enum", enum: PaymentType })
    paymentType: PaymentType;

    @Column({ type: "varchar", nullable: true })
    description: string;

    @ManyToOne(() => User, (user) => user.transactions, { eager: true })
    @JoinColumn()
    user: User;

    @BeforeInsert()
    @BeforeUpdate()
    trimFields() {
        if (this.reference) this.reference = this.reference.trim();
        if (this.gatewayReference) this.gatewayReference = this.gatewayReference.trim();
    }

    static async sumBalance(userId: string) {
        const result = await this.createQueryBuilder("transaction")
            .select("SUM(transaction.amount)", "transactionSum")
            .where("transaction.userId = :userId", { userId })
            .andWhere("transaction.status = :status", { status: TransactionStatus.Successful })
            .getRawOne();

        const totalBalance = result?.transactionSum || 0;

        try {
            await UserWallet.update(
                { user: { id: userId } },
                { balance: totalBalance }
            );
        } catch (error: any) {
            logging.error(error.message)
        }
    }

    @AfterInsert()
    @AfterUpdate()
    async updateBalance() {
        await UserTransactionModel.sumBalance(this.user.id);
    }

    @BeforeInsert()
    generateId() {
        this.id = `TransactionID-${uuidv4()}`;
    }

    @CreateDateColumn()
    createdAt: Date;
}
