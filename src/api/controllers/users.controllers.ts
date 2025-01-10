import { Request, Response, NextFunction } from "express";
import asynchandler from "express-async-handler"
import { StatusCodes } from "http-status-codes";
import AppError from "@/utils/appErrors";
import { plainToInstance } from "class-transformer";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

import { UserService } from '@/services/users.service';

export class UserController {
    constructor(private userService: UserService) { }
    
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userData } = req.body;
            const result = await this.userService.registerUser(userData);
            res.status(StatusCodes.CREATED).json(result);
        } catch (error: any) {
            console.error(error);
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    };

    async verifyOTP(req: Request, res: Response, next: NextFunction) {
        const { email, otp } = req.body; 

        try {
            // Call the service method to verify OTP
            const isVerified = await this.userService.verifyEmailOTP(email, otp);

            // If OTP is valid, return a success response
            if (isVerified) 
                res.status(200).json({
                    message: "OTP verified successfully",
                    status: "success",
                })
            else throw new AppError("Invalid or expired OTP", "failed", false, StatusCodes.BAD_REQUEST);

        } catch (error:any) {
            new AppError(`Internal Server Error`, `${error.message}`, false, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }

    async LoginUser(req: Request, res: Response, next: NextFunction): Promise<void> {
        const { phoneNumber, email, password } = req.body;


        if ((!phoneNumber && !email) || !password)
            throw new AppError("Identifier (email or phone) and password are required!", "failed", false);

        try {
            const identifier = phoneNumber || email;
            const user = await this.userService.loginUser(identifier, password);

            if (!req.session) {
                throw new AppError("Session is not available", "failed", false, StatusCodes.INTERNAL_SERVER_ERROR);
            }

            req.session.userId = user.id;
            req.session.isLoggedIn = true

            res.status(StatusCodes.OK).json({
                message: "Login Successful",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstName,
                    middleName: user.middleName,
                    lastName: user.lastName,
                    role: user.role
                }
            });

            return;
        } catch (error: any) {
            throw new AppError(`Internal Server Error`, `${error.message}`, false, StatusCodes.INTERNAL_SERVER_ERROR);
        }
    }
}