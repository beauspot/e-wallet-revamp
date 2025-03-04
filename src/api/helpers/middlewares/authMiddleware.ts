import { RequestHandler } from "express";
import ExpressAsync from "express-async-handler";

import { AppDataSource } from "@/configs/db.config";
import { User } from "@/db/user.entity";
import { ExtendRequest } from "@/interfaces/extendRequest.interface";

const UserRepository = AppDataSource.getRepository(User);

export const protect: RequestHandler = ExpressAsync(async (req: ExtendRequest, res, next) => {
  // 1. check if the session exists & has a valid user ID
  if (!req.session || !req.session.userId) {
    return next(
      new AppError(
        "You are not logged in. Please log-in to access this resource.",
        "No active session",
        false,
        401
      )
    );
  }

  // 2. Fetch the user from the database
  const currentUser = await UserRepository.findOneBy({
    id: req.session.userId
  });

  // 3. Check if the user changed their password after the session was created
  if (currentUser?.changedPasswordAfter(req.session.createdAt)) {
    return next(
      new AppError(
        "User recently changed password! Please log in again.",
        "Password changed",
        false,
        401
      )
    );
  }

  // 4. Attach the user object to the request for further use.
  req.user = {
    id: currentUser?.id,
    email: currentUser?.email,
    firstName: currentUser?.firstname,
    lastName: currentUser?.lastname,
    phoneNumber: currentUser?.phonenumber
  };
  res.locals.user = currentUser;

  next();
});
