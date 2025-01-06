import { Request, Response, NextFunction } from "express";
import asynchandler from "express-async-handler"
import { StatusCodes } from "http-status-codes";
import AppError from "@/utils/appErrors";
import { plainToInstance } from "class-transformer";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

import { UserService } from '@/services/users.service';

export class UserController{
    constructor(private userService: UserService) { }
    
    async registerUser(req: Request, res: Response, next: NextFunction) {
        try {
            const { userData } = req.body;
            const result = await this.userService.registerUser(userData);
            res.status(StatusCodes.CREATED).json(result);
        } catch (error: any) {
            console.error(error);
            throw new AppError(`${error.message}`, "failed", false, StatusCodes.SERVICE_UNAVAILABLE)
        }
    }
}