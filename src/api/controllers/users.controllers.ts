import {  RequestHandler } from "express";
import AsyncHandler from "express-async-handler";
import { StatusCodes } from "http-status-codes";
import { plainToInstance } from "class-transformer";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

import { UserService } from '@/services/users.service';

export class UserController {
    constructor(private userService: UserService) { }
    
    registerUser: RequestHandler = AsyncHandler(async (req, res, next) => {

            const { userData } = req.body;
            const result = await this.userService.registerUser(userData);
        res.status(StatusCodes.CREATED).json({
            status: "Success",
            data: result
        });

    });

    verifyOTP: RequestHandler = AsyncHandler(async (req, res, next) => {

        const { email, otp } = req.body;
        await this.userService.verifyEmailOTP(email, otp);
        res.status(StatusCodes.OK).json({
            status: 'success',
            message: "OTP verified successfully"
        });

    })

    LoginUser: RequestHandler = AsyncHandler(async (req, res, next): Promise<void> => {

        const { phoneNumber, email, password } = req.body;

            const identifier = phoneNumber || email;
            const user = await this.userService.loginUser(identifier, password);

        if (!req.session) 
                throw new AppError("Session is not available", "failed", false, StatusCodes.INTERNAL_SERVER_ERROR);

            req.session.userId = user.id;
            req.session.isLoggedIn = true

            res.status(StatusCodes.OK).json({
                message: "Login Successful",
                user: {
                    id: user.id,
                    email: user.email,
                    firstName: user.firstname,
                    middleName: user.middlename,
                    lastName: user.lastname,
                    role: user.role
                }
            });

            return;
    })

    LogoutUser: RequestHandler = AsyncHandler(async (req, res, next): Promise<void> => {
        
            if (!req.session) throw new AppError("No active session found", "failed", false, StatusCodes.BAD_REQUEST);

            await this.userService.logout(req.session);

            res.status(StatusCodes.OK).json({
                message: "Successfully logged out"
            })
        
    })
}