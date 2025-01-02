import { Response } from "express"
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import { gender_enum, userRole } from "@/enum/user.enum";
import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";

interface userInterface {
  firstName: string;
  middleName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  nin: string;
  bvn: string;
  gender: gender_enum;
  role: userRole;
  account_no: string;
  date_of_birth: Date;
}

interface DecodedToken {
  id: string;
  iat: number;
};

interface UserSercviceInterface {
  // SendOtp(phoneNumber: string): Promise<VerificationInstance>;
  // VerifyOtp(phoneNumber: string, otp: string): Promise<String>;
  signToken(userId: string): string;
  createSendToken(user: Partial<User>, res: Response): Promise<{ user: User, token: string }>
  registerUser(userData: Partial<userInterface>): Promise<{ user: User }>;
  loginUser(phoneNumber: string, password: string): Promise<User>;
  createTransactionPin(pin: string): Promise<{ userWallet: string }>;

  // Using type "any" cause we do not know the actual shape of the object.
  // verifyBvnData(firstName: string, lastName: string, bvn: string, dob: Date): Promise<any>

  // forgotPassword(email: string): Promise<string>;
  forgotTransactionPin(email: string): Promise<string>;
  // resetPassword(email: string, otp: string, newPassword: string): Promise<string>;
  resetTransactionPin(email: string, otp: string, newPin: string): Promise<string>;
  // updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<string>;
  updateTransactionPin(userId: string, currentPin: string, newPin: string): Promise<string>;
  logout(res:Response): Promise<void>;
};

export { userInterface, DecodedToken, UserSercviceInterface, VerificationInstance };