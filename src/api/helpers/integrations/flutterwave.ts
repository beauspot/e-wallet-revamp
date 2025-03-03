/* eslint-disable prettier/prettier */
/* eslint-disable no-unused-vars */

import Flutterwave from "flutterwave-node-v3";
import { StatusCodes } from "http-status-codes";

import logging from "@/utils/logging";
import { AppDataSource } from "@/configs/db.config";
import { UserTransactionModel } from "@/db/transactions.entity";
import { TransactionStatus, TransactionType, PaymentType } from "@/enum/transactions.enum";
import {
  CardChargePayload,
  AuthorizeCardPaymentPayload,
  TransferPayload,
  SubAccounts,
  virtualAccountPayload,
  AccountInfoPayload
} from "@/interfaces/flutterwave.interface";

export class FlutterwaveService {
  private flutterWave: typeof Flutterwave;

  constructor(
    private publicKey: string = process.env.FLUTTERWAVE_PUBLIC_KEY!,
    private secretKey: string = process.env.FLUTTERWAVE_SECRET_KEY!,
    private userTransactionModel: typeof UserTransactionModel = UserTransactionModel
  ) {
    this.flutterWave = new Flutterwave(this.publicKey, this.secretKey);
  }

  async chargeCard(payload: CardChargePayload) {
    try {
      const response = await this.flutterWave.Charge.card(payload);

      if (response.status === "error") {
        throw new AppError(response.message, "400", false);
      }

      if (response.meta.authorization.mode === "pin") {
        const chargePayload = {
          ...payload,
          authorization: {
            mode: "pin",
            fields: ["pin"],
            pin: payload.pin!
          }
        };
        return await this.flutterWave.Charge.card(chargePayload);
      }

      return response;
    } catch (error: any) {
      logging.error("Error charging card", error.message);
      throw new AppError(error.message, "400", false);
    }
  }

  async authorizeCardPayment(payload: AuthorizeCardPaymentPayload) {
    const updateData = {
      reference: "",
      gatewayReference: "",
      transactionType: TransactionType.Debit,
      amount: 0,
      currency: "₦",
      receipient: "",
      status: TransactionStatus.Pending,
      paymentType: PaymentType.Card,
      description: "",
      deviceFingerprint: "",
      user: { id: payload.userId }
    };

    try {
      const response = await this.flutterWave.Charge.validate({
        otp: payload.otp,
        flw_ref: payload.flw_ref
      });

      logging.info(response);

      updateData.reference = response.data.tx_ref;
      updateData.gatewayReference = response.data.flw_ref;
      updateData.transactionType = response.data.transaction_type as TransactionType;
      updateData.amount = Number(response.data.amount);
      updateData.status = response.data.status as TransactionStatus;
      updateData.description = response.data.narration;
      updateData.deviceFingerprint = response.data.device_fingerprint;
      updateData.currency = response.data.currency;

      const query = { gatewayReference: response.data.flw_ref };

      if (response.data.status === "successful" || response.data.status === "pending") {
        const transaction = await this.flutterWave.Transaction.verify({ id: response.data.id });
        await AppDataSource.getRepository(this.userTransactionModel).update(query, updateData);
        return transaction;
      }

      updateData.status = TransactionStatus.Failed;
      await AppDataSource.getRepository(this.userTransactionModel).update(query, updateData);

      return response;
    } catch (error: any) {
      logging.error("Error authorizing card payment", error.message);
      throw new AppError(error.message, "400", false);
    }
  }

  async verifyAccount(payload: AccountInfoPayload) {
    try {
      const response = await this.flutterWave.Misc.verify_Account(payload);

      if (response.status !== "success") {
        throw new AppError(
          response.message,
          "Account verification failed",
          false,
          StatusCodes.BAD_REQUEST
        );
      }

      return response.data;
    } catch (error: any) {
      logging.error("Error verifying account", error.message);
      throw new AppError(error.message, "500", false);
    }
  }

  async transfer(payload: TransferPayload) {
    try {
      return await this.flutterWave.Transfer.initiate(payload);
    } catch (error: any) {
      logging.error("Error initiating transfer", error.message);
      throw new AppError(error.message, "400", false);
    }
  }

  async createSubaccount(payload: SubAccounts) {
    try {
      const response = await this.flutterWave.Subaccount.create(payload);
      logging.info(response);
      return response;
    } catch (error: any) {
      logging.error("Error creating subaccount", error.message);
      throw new AppError(error.message, "400", false);
    }
  }

  async fetchSubaccount(payload: SubAccounts) {
    try {
      const response = await this.flutterWave.Subaccount.fetch(payload);
      logging.info(response);
      return response;
    } catch (error: any) {
      logging.error("Error fetching subaccount", error.message);
      throw new AppError(error.message, "400", false);
    }
  }

  async createVirtualAccount(payload: virtualAccountPayload) {
    try {
      const response = await this.flutterWave.VirtualAccount.create({
        email: payload.email,
        tx_ref: payload.tx_ref,
        bvn: payload.bvn,
        // firstname: payload.firstname,
        // lastname: payload.lastname,
        // phonenumber: payload.phonenumber,
        narration: payload.narration,
        is_permanent: true
      });

      if (response.status !== "success") {
        throw new AppError(`Failed to create virtual account: ${response.message}`, "400", false);
      }

      logging.info(`Virtual Account Created: ${JSON.stringify(response.data, null, 2)}`);
      return response.data;
    } catch (error: any) {
      logging.error("Error creating virtual account", error.message);
      throw new AppError(error.message, "500", false);
    }
  }
}
