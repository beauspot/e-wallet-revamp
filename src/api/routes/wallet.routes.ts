import { NextFunction, Request, Response, Router } from "express";

import { FlutterwaveService as Flw } from "@/api/helpers/integrations/flutterwave";
// import Flutterwave from "flutterwave-node-v3";
import { WalletController } from "@/controllers/wallet.controllers";
import { UserTransactionModel } from "@/db/transactions.entity";
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
// import { validate } from "@/helpers/middlewares/validate";
import { protect } from "@/middlewares/authMiddleware";
import { WalletService } from "@/services/wallet.service";

const FLW = new Flw(
  process.env.FLUTTERWAVE_PUBLIC_KEY!,
  process.env.FLUTTERWAVE_SECRET_KEY!,
  UserTransactionModel
);

const walletService = new WalletService(UserWallet, FLW, UserTransactionModel, User);
const walletController = new WalletController(walletService);

const router = Router();

router.use(protect);
router
  .route("/:id")
  .get((req: Request, res: Response, next: NextFunction) =>
    walletController.getWallet(req, res, next)
  );

router
  .route("/balance/:id")
  .get((req: Request, res: Response, next: NextFunction) =>
    walletController.getBalance(req, res, next)
  );

// TODO: implement a validation schema on this field
router
  .route("/deposit")
  .post((req: Request, res: Response, next: NextFunction) =>
    walletController.deposit(req, res, next)
  );

router
  .route("/deposit/authorize")
  .post((req: Request, res: Response, next: NextFunction) =>
    walletController.authorize(req, res, next)
  );

router
  .route("/transfer")
  .post((req: Request, res: Response, next: NextFunction) =>
    walletController.transfer(req, res, next)
  );

export default router;
