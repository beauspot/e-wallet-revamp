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
}

export {
    Email,
    EmailClassConfiguration
};
