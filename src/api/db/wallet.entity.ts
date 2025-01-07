import 'reflect-metadata'; // Import this at the very top
import { v4 as uuidv4 } from "uuid";
import * as bcrypt from "bcryptjs";
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  BeforeInsert,
  CreateDateColumn,
  OneToOne,
  JoinColumn,
  BaseEntity,
} from "typeorm";
import { User } from "@/db/user.entity";
import crypto from "crypto";

@Entity()
export class UserWallet extends BaseEntity {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: 'float', default: 0.0 }) // Explicitly define the type
  balance: number;

  @OneToOne(() => User, (user) => user.wallet)
  @JoinColumn()
  user: User;

  @BeforeInsert()
  generateId() {
    this.id = uuidv4();
  }

  @CreateDateColumn()
  createdAt: Date;

  // createPinResetToken(): string {
  //   const otp = crypto.randomBytes(3).toString("hex");
  //   this.transactionPinResetToken = crypto.createHash("sha256").update(otp).digest("hex");
  //   this.transactionPinResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now
  //   this.transaction_pinResetAttempts = 0;
  //   return otp;
  // }
}
