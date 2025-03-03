// import { Request } from "express";
import { Session } from "express-session";

declare module "express-session" {
  // Extend the SessionData interface to include custom properties
  interface SessionData {
    reCallCharge?: {
      data?: {
        flw_ref?: string;
      };
    };
    userId?: string;
    firstName?: string;
    lastName?: string;
    middleName?: string;
    email?: string;
    phoneNumber?: string;
    isLoggedIn?: boolean;
    role?: string;
    [key: string]: any;
  }
}

// Extending the Request interface to include the session property
declare global {
  namespace Express {
    interface Request {
      session: Session & SessionData; // Define the session property with the correct
    }
  }
}
