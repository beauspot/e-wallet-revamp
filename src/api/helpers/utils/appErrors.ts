/* eslint-disable no-var */

/* eslint-disable no-unused-vars */

class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public isOperational: boolean = true
  ) {
    super(message);

    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }

    this.name = this.constructor.name;
  }
}

// Global availability
declare global {
  var AppError: any;
}

global.AppError = AppError;

export default AppError;
