import { Service } from "typedi";

import bcrypt from "bcryptjs";

import { User } from "@/db/user.entity";
import AppError from "@/utils/appErrors";
import { UserWallet } from "@/db/wallet.entity";
import { AppDataSource } from "@/configs/db.config";
import { generateReference } from "@/utils/generateRef";
import { FlutterwaveService as Flw } from "@/api/helpers/integrations/flutterwave";
import { UserTransactionModel } from "@/db/transactions.entity";
import { WalletServiceInterface, SessionData } from "@/interfaces/wallet.interface";
import { TransactionType, TransactionStatus, PaymentType } from "@/enum/transactions.enum"
import { CardChargePayload, TransferPayload, AuthorizeCardPaymentPayload } from "@/interfaces/flutterwave.interface";

@Service()
export class WalletService implements WalletServiceInterface {
    constructor(private wallet: typeof UserWallet, private flw: Flw, private transaction: typeof UserTransactionModel, private user: typeof User) { }

    async getWallet(userId: string): Promise<UserWallet> {
     
            const walletRepo = AppDataSource.getRepository(this.wallet);
            const wallet = await walletRepo.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });

            if (!wallet) throw new AppError(`Wallet Not found Please contact administrator`, "Failed", false, 400);

            return wallet;
    };

    async getBalance(userId: string): Promise<number>{
     
            const walletRepository = AppDataSource.getRepository(this.wallet);
            const wallet = await walletRepository.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });

            if (!wallet) throw new AppError(
                `You don't have a wallet. Please contact the administrator`,
                "false", false, 400
            );

            return wallet.balance;
    };

    async deposit(payload: CardChargePayload, userEmail: string): Promise<UserTransactionModel> {
        
            payload.email = payload.email || userEmail;
            payload.tx_ref = generateReference("transaction");
            payload.enckey = process.env.FLUTTERWAVE_ENCRYPTION_KEY;

            const response = await this.flw.chargeCard(payload);
            return response;
     
    }

    async authorize(payload: AuthorizeCardPaymentPayload, sessionData: SessionData): Promise<SessionData> {
        
            payload.flw_ref = sessionData?.reCallCharge?.data?.flw_ref || payload.flw_ref;
            const response = await this.flw.authorizeCardPayment(payload);
            return response;
    };

    async transfer(payload: TransferPayload, userId: string): Promise<UserTransactionModel> {
    
            const walletRepository = AppDataSource.getRepository(this.wallet);
            const wallet = await walletRepository.findOne({
                where: { user: { id: userId } },
                relations: ["user"]
            });
            if (!wallet) throw new AppError("Wallet not found", "false", false, 404);

       
            const userRepository = AppDataSource.getRepository(this.user);
            const user = await userRepository.findOne({ where: { id: userId } });

            if (!user)
                throw new AppError("User not found", "false", false, 401);

            const validPin = bcrypt.compare(payload.transactionPin, user.transaction_pin);
            if (!validPin) throw new AppError("Invalid transaction pin", "false", false, 401);

            if (wallet.balance < payload.amount || wallet.balance - payload.amount <= 100) {
                throw new AppError("Insufficient funds or minimum balance required", "false", false, 400);
            }

            const details = {
                account_number: payload.account_no,
                account_bank: payload.bank,
            };

            await this.flw.verifyAccount(details);

            const transferPayload = {
                ...payload,
                reference: generateReference("transfer"),
                callback_url: `${process.env.APP_BASE_URL}/api/v1/wallet/transfer/verify`,
            };

            const response = await this.flw.transfer(transferPayload);


            const transaction = {
                reference: response.data.reference,
                gatewayReference: response.data.flw_ref || "N/A",
                transactionType: TransactionType.Debit,
                paymentType: PaymentType.Account,
                amount: response.data.amount,
                currency: response.data.currency,
                recipient: response.data.account_number.replace(/(?<=.{4})./g, "*"),
                description: response.data.narration,
                user: { id: userId },
                status: response.data.status === "NEW"
                    ? TransactionStatus.Pending
                    : response.data.status === "FAILED"
                        ? TransactionStatus.Failed
                        : TransactionStatus.Successful,
            };

            const transactionRepo = AppDataSource.getRepository(this.transaction);
            const wallet_transaction = transactionRepo.create(transaction)
            await transactionRepo.save(wallet_transaction);
            return wallet_transaction;

    }
}