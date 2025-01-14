import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import catchAsync from "express-async-handler";
import { Request, Response, NextFunction } from "express";

import AppError from "@/utils/appErrors";
import {  SessionData } from "@/interfaces/wallet.interface";
import { WalletService } from "@/services/wallet.service";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";


export class WalletController {
    constructor(private walletService: WalletService) {}

    getWallet = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);

        const wallet = await this.walletService.getWallet(req.user.id);
        res.status(StatusCodes.OK).json({ success: true, data: wallet });
    });

    getBalance = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        const balance = await this.walletService.getBalance(req.user.id);
        res.status(StatusCodes.OK).json({ success: true, data: balance });
    });

        deposit = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.email)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        const response = await this.walletService.deposit(req.body, req.user.email);
        res.status(200).json({ success: true, data: response });
    });

    authorize = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const sessionData = req.session as SessionData || {};
        const response = await this.walletService.authorize(req.body, sessionData);
        res.status(200).json({ success: true, message: "Charge on card initiated", data: response });
    });

    transfer = catchAsync(async (req: ExtendRequest, res: Response, next: NextFunction) => {
        if (!req.user || !req.user.id)
            throw new AppError("User is not authenticated.", "failed", false, StatusCodes.UNAUTHORIZED);
        const response = await this.walletService.transfer(req.body, req.user.id);
        res.status(200).json({ success: true, message: "Transfer initiated", data: response });
    });

}