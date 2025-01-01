import dotenv from "dotenv";
import { DataSource } from "typeorm";

// import logging from "@/utils/logging";
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";
import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";

dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT) || undefined,
  username: process.env.DB_USER || undefined,
  password: String(process.env.DB_PWD) ,
  database: process.env.DB_NAME || undefined,
  entities: [
    User,
    UserWallet,
    SettlementAcct,
    UserTransactionModel,
  ],
  synchronize: true, // TODO: set to false in prod
  logging: false,
});

export const db_init = async () => {
  try {
    await AppDataSource.initialize();
    log.info("Database connection established successfully.");
  } catch (error: any) {
    log.error("Database initialization error:", error.message);
    log.error(`Failed to initialize Postgres database`);
  }
};
