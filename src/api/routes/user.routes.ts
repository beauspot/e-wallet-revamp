import { NextFunction, Request, Response, Router } from "express";

import { container } from "tsyringe";

import { UserController } from "@/controllers/users.controllers";
// import { validate } from "@/helpers/middlewares/validate";
import { protect } from "@/middlewares/authMiddleware";

// import { createUserSchema, loginUserSchema } from "@/schemas/user.schema";

const user_controller = container.resolve(UserController);

const router = Router();

router
  .route("/register")
  .post((req: Request, res: Response, next: NextFunction) =>
    user_controller.registerUser(req, res, next)
  );

router
  .route("/verify-otp")
  .post((req: Request, res: Response, next: NextFunction) =>
    user_controller.verifyOTP(req, res, next)
  );

router
  .route("/login")
  .post((req: Request, res: Response, next: NextFunction) =>
    user_controller.LoginUser(req, res, next)
  );

router.use(protect);

router
  .route("/logout")
  .post((req: Request, res: Response, next: NextFunction) =>
    user_controller.LogoutUser(req, res, next)
  );

export default router;
