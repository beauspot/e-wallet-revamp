import * as bcrypt from "bcryptjs";
import crypto from "crypto"
import { Service } from "typedi";

import AppError from "@/utils/appErrors";
import redisModule from "@/configs/redis.config";
import { AppDataSource } from "@/configs/db.config";
import { EmailJobData } from "@/interfaces/email.interface";
import { userInterface, UserSercviceInterface, userWalletPayloadInterface } from "@/interfaces/user.interface";
import { virtualAccountPayload as VANPayload } from "@/interfaces/flutterwave.interface";

import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";

// import Queues
import WalletQueue from '@/queues/wallet.queues';
import emailQueues from "@/queues/email.queues";

const { redisClient } = redisModule;
const { addMailToQueue } = emailQueues;


@Service()
export class UserService implements UserSercviceInterface {
    constructor(private userEntity: typeof User) { }

    IV_LENGTH = 16;

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    };

    private async verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(inputPassword, hashedPassword);
    }

    private async hashOtp(otp: string): Promise<string> {
        const saltRounds = 10;
        return bcrypt.hash(otp, saltRounds);
    }

    private async verifyOtpHash(inputOtp: string, hashedOtp: string): Promise<boolean> {
        return bcrypt.compare(inputOtp, hashedOtp);
    }

    private encryptData(text: string): string {
        if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
            throw new AppError("Invalid ENCRYPTION_KEY: Key must be a 64-character hexadecimal string");
        }

        // Convert the hexadecimal ENCRYPTION_KEY to a 32-byte Buffer
        const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

        // Generate a random Initialization Vector (IV)
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', encryptionKey, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return iv.toString('hex') + ":" + encrypted;
    }


    private decryptData(encryptedText: string): string {
        if (!process.env.ENCRYPTION_KEY || process.env.ENCRYPTION_KEY.length !== 64) {
            throw new AppError("Invalid ENCRYPTION_KEY: Key must be a 64-character hexadecimal string");
        }

        // Convert the hexadecimal ENCRYPTION_KEY to a 32-byte Buffer
        const encryptionKey = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');

        const parts = encryptedText.split(":");
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = parts[1];

        const decipher = crypto.createDecipheriv('aes-256-cbc', encryptionKey, iv);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    };

    async registerUser(userData: Partial<userInterface>) {
        try {
            if (!userData.password) throw new AppError("Password Required");

            const hashedPassword = await this.hashPassword(userData.password);

            const userRepository = AppDataSource.getRepository(this.userEntity).create({
                ...userData,
                password: hashedPassword,
            });

            const savedUser = await AppDataSource.getRepository(this.userEntity).save(userRepository);
            // log.info(savedUser);

            // Add the VAN creation job to the queue
            const savedWallet = await WalletQueue.addVANToQueue(savedUser.id);

            // Generate OTP and hash it
            const OTP_EXPIRY_SECONDS = 300;
            const otp = crypto.randomInt(100000, 999999).toString();
            const hashedOtp = await this.hashOtp(otp);

            // Save OTP in redis with expiry 
            await redisClient.setex(`otp:${savedUser.email}`, OTP_EXPIRY_SECONDS, hashedOtp);

            const emailJobData: EmailJobData = {
                type: "welcomeEmail",
                data: {
                    to: savedUser.email,
                    firstName: savedUser.firstname,
                    otp,
                    priority: "high"
                }
            };

            await addMailToQueue(emailJobData);
            // log.info(mailingQueue);

            // log.info(savedWallet);

            return { user: savedUser, wallet: savedWallet };
        } catch (error: any) {
            log.error(`Error registering user: ${error.message}`);
            throw new AppError("Error registering user", error.message, false);
        }
    };

    async verifyEmailOTP(email: string, otp: string): Promise<boolean> {
        try {
            const hashedOtp = await redisClient.get(`otp:${email}`);

            if (!hashedOtp) throw new AppError("Invalid OTP or OTP expired");

            const isMatch = await this.verifyOtpHash(otp, hashedOtp);

            if (!isMatch) throw new AppError("Invalid OTP");

            // Reset OTP expiry
            await redisClient.expire(`otp:${email}`, 0);

            return true;
        } catch (error: any) {
            log.error(`Error verifying OTP: ${error.message}`);
            throw new AppError("Error verifying OTP", error.message, false);
        }
    }

    async loginUser(identifier: string, password: string) {
        if (!identifier || !password) throw new AppError("Provide phone or email and password!", "failed", false);
        try {
            const user = await AppDataSource.getRepository(this.userEntity).findOne({
                where: [
                    { email: identifier },
                    { phonenumber: identifier },
    
            ], select: ['id', "password"] });

            if (!user || !(await this.verifyPassword(password, user.password)))
                throw new AppError("Incorrect email/phone number or password", "failed", false);

            return user;
        } catch (error: any) {
            // logging.error(`Error in user: ${error.message}`);
            throw new AppError("login failed", `${error.message}`, false);
        }
    }

    async logout(session: Express.Session): Promise<void> {
        return new Promise((resolve, reject) => { 
            session.destroy((error: any) => {
                if (error) return reject(new AppError("Failed to destroy session."));
                resolve()
            })
        })
    }
}