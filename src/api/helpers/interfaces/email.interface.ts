export interface CommonDataFields {
    to: string;
    priority?: string;
}

export interface WelcomeEmailData extends CommonDataFields {
    firstName: string;
    otp: string;
}


export interface ResetPasswordData extends CommonDataFields {
    firstName: string;
    otp: string;
}

export interface ForgotTransactionPinData extends CommonDataFields {
    firstName: string;
    otp: string;
}

export interface __ForgotPasswordData__ extends CommonDataFields {
    firstName: string;
    otp: string;
};


export type EmailJobData =
    | { type: 'welcomeEmail'; data: WelcomeEmailData }
    | { type: 'resetPassword'; data: ResetPasswordData }
    | { type: 'forgotPassword'; data: __ForgotPasswordData__ }
    | { type: 'forgotTransactionPin'; data: ForgotTransactionPinData }

