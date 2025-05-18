import { injectable } from "tsyringe";
import { Repository } from "typeorm";

import { AppDataSource } from "@/configs/db.config";
import { UserTransactionModel } from "@/db/transactions.entity";

@injectable()
export class TransactionRepository {
  private repository: Repository<UserTransactionModel>;

  constructor() {
    this.repository = AppDataSource.getRepository(UserTransactionModel);
  }

  async createTransaction(transaction: Partial<UserTransactionModel>) {
    const newTransaction = this.repository.create(transaction);
    return this.repository.save(newTransaction);
  }

  async saveTransaction(transaction: Partial<UserTransactionModel>) {
    return this.repository.save(transaction);
  }
}
