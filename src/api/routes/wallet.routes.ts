import Flutterwave from "flutterwave-node-v3";
import { Router, Request, Response, NextFunction } from "express";

import { User } from "@/db/user.entity";
import { WalletController } from "@/controllers/wallet.controllers";
import { UserWallet } from "@/db/wallet.entity";
import { protect } from "@/middlewares/authMiddleware";
import { WalletService } from "@/services/wallet.service";
import { validate } from "@/helpers/middlewares/validate";
import { Flw } from "@/api/helpers/integrations/flutterwave";
import { UserTransactionModel } from "@/db/transactions.entity";


const FLW = new Flw(typeof Flutterwave, process.env.FLUTTERWAVE_PUBLIC_KEY!, process.env.FLUTTERWAVE_SECRET_KEY!, UserTransactionModel);

const walletService = new WalletService(UserWallet, FLW, UserTransactionModel, User);
const walletController = new WalletController(walletService);

const router = Router();

router.use(protect);
router.route("/:id").get((req: Request, res: Response, next: NextFunction) => walletController.getWallet(req, res, next));

router.route("/balance/:id").get((req: Request, res: Response, next: NextFunction) => walletController.getBalance(req, res, next));

// TODO: implement a validation schema on this field
router.route("/deposit").post((req: Request, res: Response, next: NextFunction) => walletController.deposit(req, res, next));

router.route("/deposit/authorize").post((req: Request, res: Response, next: NextFunction) => walletController.authorize(req, res, next));

router.route("/transfer").post((req: Request, res: Response, next: NextFunction) => walletController.transfer(req, res, next));

export default router;