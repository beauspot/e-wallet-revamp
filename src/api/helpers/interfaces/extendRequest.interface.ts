import { Request, Response } from "express";

// TODO: would come back to this issue
import { User } from "@/db/user.entity";

export interface ExtendRequest extends Request {
<<<<<<< HEAD
    body: any,
=======
>>>>>>> parent of 987b9a9 (do not run)
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