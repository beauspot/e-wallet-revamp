import * as nodemailer from "nodemailer";
import { EmailClassConfiguration } from "@/interfaces/email.interface";

interface User {
    email: string;
    firstName: string;
}

export class EmailService implements EmailClassConfiguration {
    private to: string;
    private firstName: string;
    private resetToken: string;
    private from: string;
    private otp: string;

    constructor(user: User, resetToken: string, otp: string) {
        this.to = user.email;
        this.firstName = user.firstName;
        this.resetToken = resetToken;
        this.from = ` WalletHub: <${process.env.EMAIL_FROM}>`;
        this.otp = otp;
    }

    private newTransport() {
        return nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || "Gmail",
            auth: {
                user: process.env.EMAIL_USERNAME,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    }

    // Send the actual email
    private async send(subject: string, template: string) {
        const mailOptions = {
            from: this.from,
            to: this.to,
            subject,
            html: template,
        };
        await this.newTransport().sendMail(mailOptions);
    }

    // This are just examples of sending mails to the user

    async sendOTPMail(): Promise<void> {
        await this.send(
            "Verification OTP",
            `<p>Your One-Time Password to verify your email is <strong>${this.otp}</strong>. Note: It is valid for only 30 seconds.</p>`
        );
    }

    async sendWelcome(): Promise<void> {
        await this.send("Welcome", `<h1>Welcome to WalletHub, ${this.firstName}!</h1>`);
    }

    async sendPasswordReset():Promise<void>  {
        await this.send(
            "Password Reset OTP",
            `<p>Forgot your password? Your One-Time Password to reset your password is <strong>${this.resetToken}</strong>. It is valid for only 10 minutes.</p>`
        );
    }
    async sendPinReset(): Promise<void> {
        await this.send(
            "Pin Reset OTP",
            `<p>Forgot your transaction pin? Your One-Time Password to reset your transaction pin is <strong>${this.resetToken}</strong>. It is valid for only 10 minutes.</p>`
        );
    }
};
