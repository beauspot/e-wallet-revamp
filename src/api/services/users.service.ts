import * as bcrypt from "bcryptjs";
import crypto from "crypto";
import { injectable, inject } from "tsyringe";

// import { Repository } from "typeorm";

// import { AppDataSource } from "@/configs/db.config";
import redisModule from "@/configs/redis.config";
// import { User } from "@/db/user.entity";
import { EmailJobData } from "@/interfaces/email.interface";
import { userInterface, UserSercviceInterface } from "@/interfaces/user.interface";
import emailQueues from "@/queues/email.queues";
// import Queues
import WalletQueue from "@/queues/wallet.queues";
import { UserRepository } from "@/repositories/user.repo";

const { redisClient } = redisModule;
const { addMailToQueue } = emailQueues;

@injectable()
export class UserService implements UserSercviceInterface {
  // constructor(@inject(User) private userEntity: Repository<User>) {}

  // eslint-disable-next-line no-unused-vars
  constructor(@inject(UserRepository) private userRepository: UserRepository) {}

  IV_LENGTH = 16;

  private async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

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

  async registerUser(userData: Partial<userInterface>) {
    if (!userData.password) {
      throw new AppError("Password Required", "failed", false, 401);
    }

    const hashedPassword = await this.hashPassword(userData.password);

    /*   const userRepository = AppDataSource.getRepository(this.userEntity).create({
      ...userData,
      password: hashedPassword
    }); */
    const userRepository = this.userRepository.create({
      ...userData,
      password: hashedPassword
    });

    // const savedUser = await AppDataSource.getRepository(this.userEntity).save(userRepository);
    const savedUser = await this.userRepository.save(userRepository);
    // log.info(savedUser);

    // Add the VAN creation job to the queue
    await WalletQueue.addVANToQueue(savedUser.id);

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

    return { user: savedUser };
  }

  async verifyEmailOTP(email: string, otp: string): Promise<boolean> {
    const hashedOtp = await redisClient.get(`otp:${email}`);

    if (!hashedOtp) {
      throw new AppError("Invalid OTP or OTP expired", 400, false);
    }

    const isMatch = await this.verifyOtpHash(otp, hashedOtp);

    if (!isMatch) {
      throw new AppError("Invalid OTP");
    }

    // Reset OTP expiry
    await redisClient.expire(`otp:${email}`, 0);

    return true;
  }

  async loginUser(identifier: string, password: string) {
    if (!identifier || !password) {
      throw new AppError("Provide phone or email and password!", 400, false);
    }

    /*  const user = await AppDataSource.getRepository(this.userEntity).findOne({
      where: [{ email: identifier }, { phonenumber: identifier }],
      select: ["id", "password"]
    }); */
    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phonenumber: identifier }],
      select: ["id", "password"]
    });

    if (!user || !(await this.verifyPassword(password, user.password))) {
      throw new AppError("Incorrect email/phone number or password", 401, false);
    }

    return user;
  }

  async logout(session: Express.Session): Promise<void> {
    return new Promise((resolve, reject) => {
      session.destroy((error: any) => {
        if (error) {
          return reject(new AppError("Logout Failed.", 500, false));
        }
        resolve();
      });
    });
  }
}
