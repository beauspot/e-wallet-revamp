import { injectable } from "tsyringe";
import { Repository, FindOneOptions } from "typeorm";

import { AppDataSource } from "@/configs/db.config";
import { UserWallet } from "@/db/wallet.entity";

@injectable()
export class UserWalletRepository {
  private repository: Repository<UserWallet>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserWallet);
  }

  async findById(id: string): Promise<UserWallet> {
    const wallet = await this.repository.findOne({
      where: { id },
      relations: ["user", "transactions"]
    });

    // eslint-disable-next-line prettier/prettier, curly
    if (!wallet) throw new AppError("Wallet Not Found", 404)
    return wallet;
  }

  async findByUserId(userId: string): Promise<UserWallet | null> {
    const wallet = await this.repository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    // eslint-disable-next-line curly
    if (!wallet) throw new AppError("Wallet Not Found", 404);
    return wallet;
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUserId(userId);
    return wallet?.balance || 0;
  }

  async findOneByUserId(userId: string): Promise<UserWallet> {
    const wallet = await this.repository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });

    if (!wallet) {
      throw new AppError("Wallet Not Found", 404);
    }
    return wallet;
  }

  async findOne(options: FindOneOptions<UserWallet>): Promise<UserWallet> {
    const wallet = await this.repository.findOne(options);

    if (!wallet) {
      throw new AppError("Wallet not found", 404);
    }
    return wallet;
  }
}
