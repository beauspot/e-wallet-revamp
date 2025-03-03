import { ErrorRequestHandler, Request, Response } from "express";

import AppError from "@/api/helpers/utils/appErrors";
import { StatusCodes } from "http-status-codes";

const globalErrorHandler: ErrorRequestHandler = (err: AppError, _: Request, res: Response) => {
  // set default values for missing Error Properties
  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  // eslint-disable-next-line no-constant-binary-expression
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
    });
  }
};

export default globalErrorHandler;
