interface EmailClassConfiguration {
    sendOTPMail(): Promise<void>;
    sendWelcome(): Promise<void>;
    sendPasswordReset(): Promise<void>;
    sendPinReset(): Promise<void>;
    send(subject: string, template: string): Promise<void>;
}

interface Email {
    from: string;
    to: string;
    subject: string;
    text: string;
};

interface UserForgotPasswordAndTransactionPin {
    email: string;
    firstName: string;
    token: string;
}

interface ForgotTransactionPinData extends UserForgotPasswordAndTransactionPin{};

interface ForgotPasswordData extends UserForgotPasswordAndTransactionPin { };

interface WelcomeEmailData {
    firstName: string;
    otp: string;
}

export {
    Email,
    EmailClassConfiguration,
    ForgotTransactionPinData,
    ForgotPasswordData,
    WelcomeEmailData,
};
