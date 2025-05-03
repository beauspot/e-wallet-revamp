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
  BeforeUpdate
} from "typeorm";
import { v4 as uuidv4 } from "uuid";

import { UserTransactionModel } from "@/db/transactions.entity";
import { User } from "@/db/user.entity";
import { FlutterwaveVirtualAccountResponse } from "@/interfaces/flutterwave.interface";

@Entity({ name: "virtualAccount" })
export class UserWallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "float", default: 0.0 })
  balance: number;

  // @Column({ type: "varchar", nullable: false })
  // firstname: string;

  // @Column({ type: "varchar", nullable: false })
  // lastname: string;

  @Column({ nullable: true, unique: true, type: "varchar" })
  virtualAccountNumber: string;

  @Column({ nullable: false, type: "varchar" })
  virtualAccountName: string;

  @Column({ nullable: true, type: "varchar" })
  bankName: string;

  @Column({ nullable: false, type: "varchar" })
  txReference: string;

  @Column({ nullable: false, type: "varchar" })
  narration: string;

  @Column({ nullable: true, type: "varchar" })
  accountStatus: string;

  @Column({ nullable: true, type: "varchar" })
  responseCode: string;

  @Column({ nullable: true, type: "varchar" })
  responseMessage: string;

  @Column({ nullable: true, type: "varchar" })
  orderRef: string;

  @Column({ nullable: true, type: "varchar" })
  expiryDate: string;

  @Column({ nullable: true, type: "varchar" })
  amount: string;

  @OneToOne(() => User, user => user.wallet, {
    onDelete: "CASCADE"
  })
  user: User;

  @OneToMany(() => UserTransactionModel, transaction => transaction.user)
  @JoinColumn({ name: "transaction_id", referencedColumnName: "id" })
  transactions: UserTransactionModel[];

  @CreateDateColumn()
  createdAt: Date;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @BeforeInsert()
  setUserDetails() {
    if (this.user) {
      // this.firstname = this.user.firstname;
      // this.lastname = this.user.lastname;
      this.virtualAccountName = `${this.user.firstname} ${this.user.lastname}`;
      if (this.user.account_no) {
        this.virtualAccountNumber = this.user.account_no;
      } else {
        this.virtualAccountNumber = this.user.phonenumber;
      }
      if (this.user.address) {
        this.narration = `Narration: ${this.user.firstname} ${this.user.lastname} - ${this.user.address}`;
      } else {
        this.narration = `Narration: ${this.user.firstname} ${this.user.lastname}`;
      }
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  syncVirtualAccountNumberWithUser() {
    if (this.user) {
      this.virtualAccountNumber = this.user.account_no;
    }
  }

  // Method to update wallet with Flutterwave virtual account details
  updateVirtualAccountDetails(response: FlutterwaveVirtualAccountResponse) {
    this.virtualAccountNumber = response.data.account_number;
    this.virtualAccountName = `${this.user.firstname} ${this.user.lastname}`;
    this.bankName = response.data.bank_name;
    this.txReference = response.data.flw_ref;
    this.accountStatus = response.data.account_status || "active";
    this.responseCode = response.data.response_code;
    this.responseMessage = response.data.response_message;
    this.orderRef = response.data.order_ref;
    this.expiryDate = response.data.expiry_date;
    this.amount = response.data.amount;
    this.narration = response.data.note;
  }
}
