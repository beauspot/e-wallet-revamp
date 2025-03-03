import dotenv from "dotenv";
import { DataSource } from "typeorm";

import { SettlementAcct } from "@/db/settlementAccts.entity";
import { UserTransactionModel } from "@/db/transactions.entity";
// import logging from "@/utils/logging";
import { User } from "@/db/user.entity";
import { UserWallet } from "@/db/wallet.entity";

dotenv.config();

// Load the appropriate .env file based on NODE_ENV
if (process.env.NODE_ENV === "test") {
  dotenv.config({ path: ".env.test" }); // Explicitly load .env.test
} else {
  dotenv.config(); // Load the default .env
}

log.info(`Current Environment: ${process.env.NODE_ENV} Environment`);

const isDevelopment = process.env.NODE_ENV === "development";
const synchronize = isDevelopment;

const { DB_HOST, DB_PORT, DB_USER, DB_PWD, DB_NAME } = process.env;

// Fail fast if required environment variables are missing
if (!DB_HOST || !DB_PORT || !DB_USER || !DB_PWD || !DB_NAME) {
  log.error("One or more required database environment variables are missing.");
  throw new Error("Database configuration error: Missing environment variables.");
}

export const AppDataSource = new DataSource({
  type: "postgres",
  host: DB_HOST,
  port: Number(DB_PORT),

  username: DB_USER,
  password: DB_PWD,
  database: DB_NAME,
  entities: [User, UserWallet, SettlementAcct, UserTransactionModel],
  // logging: false,
  logging: ["error", "warn", "schema"],
  synchronize: synchronize,
  ssl:
    process.env.NODE_ENV === "production"
      ? {
          rejectUnauthorized: false
        }
      : false
  // migrations:
});

export const db_init = async () => {
  try {
    await AppDataSource.initialize();
    log.info("Database connection established successfully.");
  } catch (error: any) {
    log.error("Database initialization error:", error.message);
    log.error("Failed to initialize Postgres database");
  }
};
