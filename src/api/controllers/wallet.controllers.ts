import { RequestHandler } from "express";
import AsyncHandler from "express-async-handler";

import { injectable, inject } from "tsyringe";

import { ExtendRequest } from "@/interfaces/extendRequest.interface";
import { SessionData } from "@/interfaces/wallet.interface";
import { WalletService } from "@/services/wallet.service";
import { StatusCodes } from "http-status-codes";

@injectable()
export class WalletController {
  // eslint-disable-next-line no-unused-vars
  constructor(@inject(WalletService) private walletService: WalletService) {}

  getWallet: RequestHandler = AsyncHandler(async (req: ExtendRequest, res) => {
    if (!req.user?.id) {
      throw new AppError("User is not authenticated.", StatusCodes.UNAUTHORIZED, false);
    }

    const wallet = await this.walletService.getWallet(req.user.id);
    res.status(StatusCodes.OK).json({
      status: "Success",
      data: wallet
    });
  });

  getBalance: RequestHandler = AsyncHandler(async (req: ExtendRequest, res) => {
    if (!req.user?.id) {
      throw new AppError("User is not authenticated.", StatusCodes.UNAUTHORIZED, false);
    }
    const balance = await this.walletService.getBalance(req.user.id);
    res.status(StatusCodes.OK).json({
      status: "Success",
      data: balance
    });
  });

  deposit: RequestHandler = AsyncHandler(async (req: ExtendRequest, res) => {
    if (!req.user?.email) {
      throw new AppError("User is not authenticated.", StatusCodes.UNAUTHORIZED, false);
    }
    const response = await this.walletService.deposit(req.body, req.user.email);
    res.status(200).json({
      status: "Success",
      data: response
    });
  });

  authorize: RequestHandler = AsyncHandler(async (req, res) => {
    const sessionData = (req.session as SessionData) || {};
    const response = await this.walletService.authorize(req.body, sessionData);
    res.status(200).json({
      status: "Success",
      message: "Charge on card initiated",
      data: response
    });
  });

  transfer: RequestHandler = AsyncHandler(async (req: ExtendRequest, res) => {
    if (!req.user?.id) {
      throw new AppError("User is not authenticated.", StatusCodes.UNAUTHORIZED, false);
    }
    const response = await this.walletService.transfer(req.body, req.user.id);
    res.status(200).json({
      status: "Success",
      message: "Transfer initiated",
      data: response
    });
  });
}
