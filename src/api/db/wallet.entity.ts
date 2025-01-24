import { v4 as uuidv4 } from "uuid";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  OneToOne,
  OneToMany,
  JoinColumn,
  BaseEntity,
} from "typeorm";
import { UserTransactionModel } from "@/db/transactions.entity";
import { User } from "@/db/user.entity";

@Entity()
export class UserWallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'float', default: 0.0 }) // Explicitly define the type
  balance: number;

  @Column({ type: "varchar", nullable: false })
  firstName: string;

  @Column({ type: "varchar", nullable: false })
  lastName: string;

  @Column({nullable: false, unique: true, type: 'varchar'})
  virtualAccountNumber: string;

  @Column({ nullable: false, type: 'varchar' })
  virtualAccountName: string;

  @Column({ nullable: true, type: 'varchar' })
  bankName: string;

  @Column({ nullable: false })
  txReference: string;

  @Column({nullable: false, type: 'varchar'})
  narration: string;

  @OneToOne(() => User, (user) => user.wallet, {
    onDelete: "CASCADE",
  })
  @JoinColumn()
  user: User;

  @OneToMany(() => UserTransactionModel, (transaction) => transaction.user)
  @JoinColumn()
  transactions: UserTransactionModel[];

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @CreateDateColumn()
  createdAt: Date;

  // Method to update wallet with flutterwave virtual account details
  updateVirtualAccountDetails(accountNumber: string, accountName: string, bankName: string, txRef: string) {
    this.virtualAccountNumber = accountNumber;
    this.virtualAccountName = accountName;
    this.bankName = bankName;
    this.txReference = txRef;
  }
}
