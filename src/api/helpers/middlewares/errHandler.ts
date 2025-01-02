import { Request, Response, NextFunction } from "express";
import AppError from "@/api/helpers/utils/appErrors";

const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  log.error(err);
  if (err instanceof AppError)
    return res.status(err.statusCode!).json({ msg: err.message });

  next();
};

export default errorHandlerMiddleware;
