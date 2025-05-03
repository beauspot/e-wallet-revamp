/* eslint-disable quotes */
import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1741158530426 implements MigrationInterface {
  name = "CreateInitialTables1741158530426";
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Ensure uuid extension is enabled
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`);

    // Create ENUM types first
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE gender_enum AS ENUM ('male', 'female', 'other');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE userRole AS ENUM ('Customer', 'Admin', 'SuperAdmin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "transactions_transactiontype_enum" AS ENUM ('Debit', 'Credit');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Drop existing enum if needed (add this)
    await queryRunner.query('DROP TYPE IF EXISTS "transactions_transactiontype_enum"');

    // Create enum with exact case
    await queryRunner.query(`
    CREATE TYPE "transactions_transactiontype_enum" AS ENUM ('Debit', 'Credit');
  `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE TransactionStatus AS ENUM ('Pending', 'Completed', 'Failed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE PaymentType AS ENUM ('BankTransfer', 'Card', 'Crypto');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create User Table
    await queryRunner.query(`
      CREATE TABLE "User" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "firstname" varchar NOT NULL,
        "middlename" varchar,
        "lastname" varchar NOT NULL,
        "phonenumber" varchar UNIQUE NOT NULL,
        "email" varchar UNIQUE NOT NULL,
        "date_of_birth" date NOT NULL,
        "password" varchar NOT NULL,
        "transaction_pin" varchar NOT NULL,
        "nin" varchar UNIQUE,
        "bvn" varchar UNIQUE NOT NULL,
        "gender" gender_enum NOT NULL,
        "role" userRole DEFAULT 'Customer',
        "address" text,
        "passwordChangedAt" timestamp,
        "passwordResetToken" varchar,
        "passwordResetExpires" timestamp,
        "passwordResetAttempts" integer DEFAULT 0,
        "account_no" varchar UNIQUE,
        "transactionPinResetExpires" timestamp,
        "transaction_pinResetAttempts" integer DEFAULT 0,
        "transactionPinResetToken" varchar,
        "transactionPinTokenExpires" timestamp,
        "transactionResetAttempts" integer DEFAULT 0,
        "createdAt" timestamp DEFAULT now(),
        "updatedAt" timestamp DEFAULT now()
      );
    `);

    // Create Virtual Account Table
    await queryRunner.query(`
      CREATE TABLE "virtualAccount" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "balance" float DEFAULT 0.0,
        "virtualAccountNumber" varchar UNIQUE,
        "virtualAccountName" varchar NOT NULL,
        "bankName" varchar,
        "txReference" varchar NOT NULL,
        "narration" varchar NOT NULL,
        "accountStatus" varchar,
        "responseCode" varchar,
        "responseMessage" varchar,
        "orderRef" varchar,
        "expiryDate" varchar,
        "amount" varchar,
        "userId" uuid UNIQUE,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);

    // Create Transactions Table
    await queryRunner.query(`
    CREATE TABLE "transactions" (
      "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
      "reference" varchar NOT NULL,
      "gatewayReference" varchar NOT NULL,
      "transactionType" "transactions_transactiontype_enum" DEFAULT 'Debit',
      "amount" numeric(10,2) DEFAULT 0,
      "currency" varchar DEFAULT '₦',
      "recipient" varchar,
      "status" TransactionStatus DEFAULT 'Pending',
      "paymentType" PaymentType NOT NULL,
      "description" varchar,
      "userId" uuid,
      "walletId" uuid,
      "createdAt" timestamp DEFAULT now(),
      FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE,
      FOREIGN KEY ("walletId") REFERENCES "virtualAccount"("id") ON DELETE SET NULL
    );
  `);

    // Fix table name from "settlemeant" to "settlement"
    await queryRunner.query(`
      CREATE TABLE "settlement" (
        "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
        "accountNumber" varchar(10) NOT NULL,
        "accountName" varchar NOT NULL,
        "default" boolean DEFAULT false,
        "userAcctId" uuid UNIQUE,
        "createdAt" timestamp DEFAULT now(),
        FOREIGN KEY ("userAcctId") REFERENCES "User"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP TABLE "settlement"');
    await queryRunner.query('DROP TABLE "transactions"');
    await queryRunner.query('DROP TABLE "virtualAccount"');
    await queryRunner.query('DROP TABLE "User"');
    await queryRunner.query("DROP TYPE IF EXISTS gender_enum");
    await queryRunner.query("DROP TYPE IF EXISTS userRole");
    await queryRunner.query('DROP TYPE IF EXISTS "transactions_transactiontype_enum"');
    await queryRunner.query("DROP TYPE IF EXISTS TransactionStatus");
    await queryRunner.query("DROP TYPE IF EXISTS PaymentType");
  }
}
