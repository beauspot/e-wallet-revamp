/* eslint-disable no-var */
/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable no-unused-vars */
import { AppErrorInterface } from "@/interfaces/appError.interface";

class AppError extends Error implements AppErrorInterface {
  constructor(
    public message: string,
    public status?: string,
    public isOperational?: boolean,
    public statusCode?: number
  ) {
    // Call the super constructor to set the error message
    super(message);

    // Set additional properties for the error
    this.statusCode = statusCode; // HTTP status code

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error"; // Status string: "fail" for 4xx codes, "error" for others

    this.isOperational = true; // Indicates whether the error is operational (i.e. caused by user input) or a programming error

    // Capture the stack trace for debugging
    Error.captureStackTrace(this, this.constructor);
  }
}

declare global {
  // @ts-ignore
  var Apprror: typeof AppError;
}

// @ts-ignore
globalThis.AppError = AppError;

export default AppError;
