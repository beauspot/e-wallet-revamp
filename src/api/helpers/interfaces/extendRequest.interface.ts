import { Request, Response } from "express";

// TODO: would come back to this issue
import { User } from "@/db/user.entity";

export interface ExtendRequest extends Request {

    body: any
    user?: {
        id?: string;
        email?: string;
        firstName?: string;
        lastName?: string;
        phoneNumber?: string;
    }
};

export interface ExtendResponse extends Response {
    locals: {
        user?: User;
    };
}