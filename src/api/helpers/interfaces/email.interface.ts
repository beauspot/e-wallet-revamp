export interface EmailClassConfiguration {
    sendWelcome(): Promise<void>;
    sendPasswordReset(): Promise<void>;
    sendPinReset(): Promise<void>;
}