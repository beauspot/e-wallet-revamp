import { UserWallet } from "@/db/wallet.entity";
import { UserTransactionModel } from "@/db/transactions.entity";
import { CardChargePayload, TransferPayload, AuthorizeCardPaymentPayload } from "@/interfaces/flutterwave.interface";

export interface SessionData {
    reCallCharge?: {
        data?: {
            flw_ref?: string;
        };
    };
};

export interface WalletServiceInterface {
    getWallet(userId: string): Promise<UserWallet>;
    getBalance(userId: string): Promise<number>;
    changePin(userId: string, oldPin: string, newPin: string): Promise<UserWallet>;
    deposit(payload: CardChargePayload, userEmail: string): Promise<UserTransactionModel>;
    authorize(payload: AuthorizeCardPaymentPayload, sessionData: SessionData): Promise<SessionData>;
    transfer(payload: TransferPayload, userId: string): Promise<UserTransactionModel>;
};