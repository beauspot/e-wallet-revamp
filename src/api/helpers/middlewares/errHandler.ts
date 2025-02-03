import { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import { StatusCodes } from "http-status-codes";
import AppError from "@/api/helpers/utils/appErrors";

const globalErrorHandler: ErrorRequestHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // set default values for missing Error Properties
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const status = err.status || "error" || "Error";

  // Check if it's an operational error or a programming error
  if (err.isOperational) {
    res.status(statusCode).json({
      status,
      message: err.message
    });
  } else {
    log.error("ERROR 💥:", err);

    // Send a Generic message for unknown errors
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      status: "Error",
      message: err.message
    })
  }
};

export default globalErrorHandler;
