import { NextFunction, Request, Response, Router } from "express";

import { UserController } from "@/controllers/users.controllers";
import { User } from "@/db/user.entity";
// import { validate } from "@/helpers/middlewares/validate";
import { protect } from "@/middlewares/authMiddleware";
// import { createUserSchema, loginUserSchema } from "@/schemas/user.schema";
import { UserService } from "@/services/users.service";

// Dependency injection
const user_service = new UserService(User);
const user_controller = new UserController(user_service);

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
