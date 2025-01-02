import { VerificationInstance } from "twilio/lib/rest/verify/v2/service/verification";

export interface TwilioClassConfig {
    sendOtp(phoneNumber: string): Promise<VerificationInstance>;
    verifyOtp(phoneNumber: string, otp: string): Promise<String>
}