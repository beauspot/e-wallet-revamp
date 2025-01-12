import { User } from "@/db/user.entity";
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


interface UserSercviceInterface {
  registerUser(userData: Partial<userInterface>): Promise<{ user: User }>;
  verifyEmailOTP(email: string, otp: string): Promise<boolean>;
  loginUser(identifier: string, password: string): Promise<User>;
  logout(session:Express.Session): Promise<void>;
  // forgotPassword(identifier: string): Promise<string>;
  // forgotTransactionPin(email: string): Promise<string>;
  // resetPassword(email: string, otp: string, newPassword: string): Promise<string>;
  // resetTransactionPin(email: string, otp: string, newPin: string): Promise<string>;
  // updatePassword(userId: string, currentPassword: string, newPassword: string): Promise<string>;
  // updateTransactionPin(userId: string, currentPin: string, newPin: string): Promise<string>;
};

export { userInterface, UserSercviceInterface, VerificationInstance };