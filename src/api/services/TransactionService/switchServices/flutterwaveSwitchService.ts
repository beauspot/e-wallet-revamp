import { walletsAbstracts } from "../Abstracts/walletsAbstracts";
import Flutterwave from "flutterwave-node-v3";
import { StatusCodes } from "http-status-codes";

import logging from "@/utils/logging";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import {
  TransactionStatus,
  TransactionType,
  PaymentType,
} from "@/enum/transactions.enum";
import { UserTransactionModel } from "@/db/transactions.entity";
import {
  CardChargePayload,
  AuthorizeCardPaymentPayload,
  TransferPayload,
  SubAccounts,
  virtualAccountPayload,
  AccountInfoPayload,
} from "@/interfaces/flutterwave.interface";
import { ICreateWallet } from "../Data/Models";

// this is the "flutterWave" service provider

export class flutterWave extends walletsAbstracts {
  constructor(
    private flutterWave: typeof Flutterwave,
    private publicKey: string = process.env.FLUTTERWAVE_PUBLIC_KEY!,
    private secretKey: string = process.env.FLUTTERWAVE_SECRET_KEY!,
    private userTransactionModel?: typeof UserTransactionModel
  ) {
    super();
    this.flutterWave = new Flutterwave(this.publicKey, this.secretKey);
  }

  async createWallets(payload: ICreateWallet): Promise<any> {
    try {
      const response = await this.flutterWave.VirtualAccount.create({
        email: payload.email,
        tx_ref: payload.tx_ref,
        bvn: payload.bvn,
        firstName: payload.firstName,
        lastName: payload.lastName,
        phoneNumber: payload.PhoneNumber,
        narration: `account creation for ${payload.lastName} ${payload.firstName}`,
        is_permanent: true,
        bank_name: payload.bank_name,
      });
      logging.info(`Virtual account Payload: ${response}`);
      return response;
    } catch (error: any) {
      logging.error(error.message);
    }
  }


  async debitWallets(): Promise<any> {
    return "Debiting wallets another switch service...";
  }

  async withdrawWallets(): Promise<any> {
    return "withdrawing from wallets another switch service...";
  }

  async walletDetails(): Promise<any> {
    return "fetching wallet details another switch service...";
  }
  async transactionHistory(): Promise<any> {
    return "fetching transaction history another switch service...";
  }
  chargeCard = async (payload: CardChargePayload) => {
    try {
      const response = await this.flutterWave.Charge.card(payload);
      let reCallCharge;

      if (response.status == "error") {
        throw new Error(response.message);
      }

      // Authorizing transactions
      if (response.meta.authorization.mode === "pin") {
        let chargePayload = {
          ...payload,
          authorization: {
            mode: "pin",
            fields: ["pin"],
            pin: payload.pin!,
          },
        };
        reCallCharge = await this.flutterWave.Charge.card(chargePayload);
      }
      return reCallCharge;
    } catch (error: any) {
      throw new AppError(error.message, "400", false);
    }
  };

  authorizeCardPayment = async (payload: AuthorizeCardPaymentPayload) => {
    // Add the OTP to authorize the transaction
    let transaction;
    let updateData = {
      reference: "",
      gatewayReference: "",
      transactionType: TransactionType.Debit || TransactionType.Credit,
      amount: 0,
      currency: "₦",
      receipient: "",
      status:
        TransactionStatus.Pending ||
        TransactionStatus.Successful ||
        TransactionStatus.Failed ||
        TransactionStatus.Flagged,
      paymentType: PaymentType.Card || PaymentType.Account,
      description: "",
      deviceFingerprint: "",
      user: { id: payload.userId }, // use a partial entity object for `user` because of Typeorm
    };

    try {
      const response = await this.flutterWave.Charge.validate({
        otp: payload.otp,
        flw_ref: payload.flw_ref,
      });

      logging.info(response);

      updateData.reference = response.data.tx_ref;
      updateData.gatewayReference = response.data.flw_ref;
      updateData.paymentType = response.data.payment_type as PaymentType;
      updateData.transactionType = response.data
        .transaction_type as TransactionType;
      updateData.amount = Number(response.data.amount);
      updateData.status = response.data.status as TransactionStatus;
      updateData.description = response.data.narration;
      updateData.deviceFingerprint = response.data.device_fingerprint;
      updateData.currency = response.data.currency;
      updateData.user = response.payload.userId;

      if (
        response.data.status === "successful" ||
        response.data.status === "pending"
      ) {
        // Verify the payment
        const transactionId = response.data.id;
        transaction = await this.flutterWave.Transaction.verify({
          id: transactionId,
        });

        const query = { gatewayReference: transaction.data.flw_ref };

        // TODO: anywhere you see "Transaction", change to "UserTransactionModel"
        // TODO: setting the TransactioType properly for the updateData.
        await AppDataSource.getRepository(this.userTransactionModel!).update(
          query,
          updateData
        );
        return transaction;
      }

      updateData.status = TransactionStatus.Failed || TransactionStatus.Flagged;

      // TODO: setting the TransactioType properly for the updateData.
      await AppDataSource.getRepository(this.userTransactionModel!).update(
        { gatewayReference: response.data.flw_ref },
        updateData
      );

      return response;
    } catch (error: any) {
      logging.error("Error authorizing card payment", error.message);
      throw new AppError(error.message, "400", false);
    }
  };

  verifyAccount = async (payload: AccountInfoPayload) => {
    try {
      const res = await this.flutterWave.Misc.verify_Account(payload);

      if (res.status !== "success")
        throw new AppError(
          `${res.message}`,
          "fetching account details failed",
          false
        );

      // acct details: acct name, acct number
      return res.data;
    } catch (error: any) {
      if (
        error.message &&
        error.message.includes("Account verification failed")
      )
        throw new AppError(
          "Invalid account number or bank code",
          "Bank account is invalid or doesn't exist",
          false,
          StatusCodes.NOT_FOUND
        );

      throw new AppError(
        error.message || "Failed to verify account",
        "account verification failed",
        false,
        StatusCodes.INTERNAL_SERVER_ERROR
      );
    }
  };
  // Creating virtual accounts which would be mapped to your custom account identifier

  /*****  Transfers  *****/
  transfer = async (payload: TransferPayload) => {
    // transfer directly to another customer using myWallet
    try {
      const response = await this.flutterWave.Transfer.initiate(payload);

      return response;
    } catch (error: any) {
      throw new AppError(error.message, "400", false);
    }
  };

  /*****  subaccount creation  *****/
  createSubaccount = async (payload: SubAccounts) => {
    try {
      const response = await this.flutterWave.Subaccount.create(payload);
      logging.info(response);
    } catch (error: any) {
      logging.error(error);
    }
  };


  fetchSubaccount = async (payload: SubAccounts) => {
    try {
      const response = await this.flutterWave.Subaccount.fetch(payload);
      logging.info(response);
    } catch (error: any) {
      logging.error(error);
    }
  };


}
