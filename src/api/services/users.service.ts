import { promisify } from "util";
import * as bcrypt from "bcryptjs";
import crypto from "crypto"
import { Service } from "typedi";
import { Response } from "express";

import { EmailService } from "@/api/helpers/integrations/email";
import { Flw } from "@/api/helpers/integrations/flutterwave";
import AppError from "@/utils/appErrors";
import { AppDataSource } from "@/configs/db.config";
import { userInterface, UserSercviceInterface } from "@/interfaces/user.interface";
import { virtualAccountPayload as VANPayload } from "@/interfaces/flutterwave.interface";

import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";

import MailingQueue from '@/queues/email.queues';
import WalletQueue from '@/queues/wallet.queues';

@Service()
export class UserService implements UserSercviceInterface {
    constructor(private userEntity: typeof User, private userWalletEntity: typeof UserWallet, private flutterwave: Flw) { }

    IV_LENGTH = 16;

    private async hashPassword(password: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(password, saltRounds);
    };

    private async verifyPassword(inputPassword: string, hashedPassword: string): Promise<boolean> {
        return bcrypt.compare(inputPassword, hashedPassword);
    }

    private async hashPin(pin: string): Promise<string> {
        const saltRounds = 12;
        return bcrypt.hash(pin, saltRounds);
    }

    private encryptData(text: string): string {
        // Generate a random Iitialization Vector (IV)
        const iv = crypto.randomBytes(this.IV_LENGTH);
        const cipher = crypto.createCipheriv('aes-256-cbc', process.env.ENCRYPTION_KEY!, iv);

        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        return iv.toString('hex') + ":" + encrypted;
    };


    private decryptData(encryptedText: string): string {
        const parts = encryptedText.split(":");
        const iv = Buffer.from(parts[0], 'hex');
        const encryptedData = parts[1];

        const decipher = crypto.createDecipheriv('aes-256-cbc', process.env.ENCRYPTION_KEY!, iv);

        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    }

    async registerUser(userData: Partial<userInterface>) {
        try {
            if (!userData.password) throw new AppError("Password Required");

            const hashedPassword = await this.hashPassword(userData.password);

            const encryptBVN = this.encryptData(userData.bvn!);
            const encryptNIN = this.encryptData(userData.nin!);

            const userRepository = AppDataSource.getRepository(this.userEntity).create({
                ...userData,
                nin: encryptNIN,
                bvn: encryptBVN,
                password: hashedPassword,
            });

            const savedUser = await AppDataSource.getRepository(this.userEntity).save(userRepository);

            const walletRepository = AppDataSource.getRepository(this.userWalletEntity).create({
                balance: 0,
                user: savedUser
            });


            const vanPayload: VANPayload = {
                firstName: savedUser.firstName,
                lastName: savedUser.lastName,
                email: savedUser.email,
                phoneNumber: savedUser.phoneNumber,
                bvn: savedUser.bvn,
                userId: savedUser.id,
                walletId: walletRepository.id,
                is_permanent: true
            };

            await WalletQueue.addVANToQueue(vanPayload);
            const savedWallet = await AppDataSource.getRepository(this.userWalletEntity).save(walletRepository);

            return { user: savedUser, wallet: savedWallet };
        } catch (error: any) {
            log.error(`Error registering user: ${error.message}`);
            throw new AppError("Error registering user", error.message, false);
        }
    }
}