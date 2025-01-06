import { Express, Router, Request, Response, NextFunction } from "express";

import { User } from "@/db/user.entity";
import { UserTransactionModel } from "@/db/transactions.entity";
import { protect } from "@/middlewares/authMiddleware";
import { UserWallet } from "@/db/wallet.entity";
import { UserService } from "@/services/users.service";
import { validate } from "@/helpers/middlewares/validate";
import { UserController } from "@/controllers/users.controllers";
import { Flw } from "@/api/helpers/integrations/flutterwave";

import { createUserSchema, loginUserSchema } from "@/schemas/user.schema";

// Dependency injection
const flw = new Flw(
    process.env.FLUTTERWAVE_PUBLIC_KEY,
    process.env.FLUTTERWAVE_SECRET_KEY,
    process.env.FLUTTERWAVE_ENCRYPTION_KEY,
    UserTransactionModel,
)
const user_service = new UserService(User, UserWallet);
const user_controller = new UserController(user_service);


const router = Router();
router.route("/register").post((req: Request, res: Response, next: NextFunction) => user_controller.registerUser(req, res, next))


export default router