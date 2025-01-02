import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import {
  Entity,
  Column,
  BeforeInsert,
  OneToMany,
  OneToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import crypto from "crypto";
import { UserWallet } from "@/db/wallet.entity";
import { gender_enum, userRole } from "@/enum/user.enum";
import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";


@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: false })
  firstName: string;

  @Column({ type: "varchar", nullable: true })
  middleName: string;

  @Column({ type: "varchar", nullable: false })
  lastName: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  phoneNumber: string;

  @Column({ type: "varchar", unique: true, nullable: false })
  email: string;

  @Column({ type: "date", nullable: false })
  date_of_birth: Date;

  @Column({ type: "varchar", nullable: false })
  password: string;

  @Column({ type: "varchar", unique: true, length: 11, nullable: false })
  nin: string;

  @Column({ type: "varchar", unique: true, length: 11, nullable: false })
  bvn: string;

  @Column({ type: "enum", enum: gender_enum, nullable: false })
  gender: gender_enum;

  @Column({ type: "enum", enum: userRole, default: userRole.Customer, nullable: false })
  role: userRole;

  @Column({ type: "varchar", unique: true, nullable: true })
  account_no: string;

  @Column({ type: "varchar", nullable: true })
  accountName: string;

  @Column({ type: "text", nullable: true })
  address: string;

  @Column({ type: "timestamp", nullable: true })
  passwordChangedAt: Date;

  @Column({ type: "varchar", nullable: true })
  passwordResetToken: string;

  @Column({ type: "timestamp", nullable: true })
  passwordResetExpires: Date;

  @Column({ type: "int", default: 0 })
  passwordResetAttempts: number;

  @OneToOne(() => SettlementAcct, (settlementAcct) => settlementAcct.userAcct, {
    cascade: true,
  })
  @JoinColumn()
  settlementAcct: SettlementAcct;

  @OneToOne(() => UserWallet, (wallet) => wallet.user, {
    cascade: true,
  })
  @JoinColumn()
  wallet: UserWallet;

  @OneToMany(() => UserTransactionModel, (transaction) => transaction.user, {
    cascade: true,
  })
  transactions: UserTransactionModel[];

  @BeforeInsert()
  generateAccountName() {
    this.accountName = `${this.firstName} ${this.middleName} ${this.lastName}`
    }

  @BeforeInsert()
  generateAccountID() {
    this.account_no = this.phoneNumber;
  }

  @BeforeInsert()
  async generateId() {
    this.id = uuidv4();
  }

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  createPasswordResetToken(): string {
    const otp = crypto.randomBytes(3).toString("hex");
    this.passwordResetToken = crypto.createHash("sha256").update(otp).digest("hex");
    this.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
    this.passwordResetAttempts = 0;
    return otp;
  }

  changedPasswordAfter(JWTTimestamp: number): boolean {
    if (this.passwordChangedAt) {
      const changedTimestamp = Math.floor(this.passwordChangedAt.getTime() / 1000);
      return JWTTimestamp < changedTimestamp;
    }
    return false;
  }
}
