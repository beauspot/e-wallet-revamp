import { NextFunction, Request, Response, Router } from "express";

import { container } from "tsyringe";

import { WalletController } from "@/controllers/wallet.controllers";
import { protect } from "@/middlewares/authMiddleware";

const walletController = container.resolve(WalletController);

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
