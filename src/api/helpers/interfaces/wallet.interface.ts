/* eslint-disable no-unused-vars */
import { UserTransactionModel } from "@/db/transactions.entity";
import { UserWallet } from "@/db/wallet.entity";
import {
  AuthorizeCardPaymentPayload,
  CardChargePayload,
  TransferPayload
} from "@/interfaces/flutterwave.interface";

export interface SessionData {
  reCallCharge?: {
    data?: {
      flw_ref?: string;
    };
  };
}

export interface WalletServiceInterface {
  getWallet(userId: string): Promise<UserWallet>;
  getBalance(userId: string): Promise<number>;
  deposit(payload: CardChargePayload, userEmail: string): Promise<UserTransactionModel>;
  authorize(payload: AuthorizeCardPaymentPayload, sessionData: SessionData): Promise<SessionData>;
  transfer(payload: TransferPayload, userId: string): Promise<UserTransactionModel>;
}
