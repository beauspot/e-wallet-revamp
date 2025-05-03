import { injectable } from "tsyringe";
import { Repository } from "typeorm";

import { AppDataSource } from "@/configs/db.config";
import { UserWallet } from "@/db/wallet.entity";

@injectable()
export class UserWalletRepository {
  private repository: Repository<UserWallet>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserWallet);
  }

  async findByUserId(userId: string): Promise<UserWallet | null> {
    return this.repository.findOne({
      where: { user: { id: userId } },
      relations: ["user"]
    });
  }

  async getBalance(userId: string): Promise<number> {
    const wallet = await this.findByUserId(userId);
    return wallet?.balance || 0;
  }
}
