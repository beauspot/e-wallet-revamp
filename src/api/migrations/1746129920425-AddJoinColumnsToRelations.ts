import { MigrationInterface, QueryRunner } from "typeorm";

export class AddJoinColumnsToRelations1746129920425 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        ALTER TABLE "User"
        ADD COLUMN "settlement_acctount_id" VARCHAR(255)
        `);

    await queryRunner.query(`
        ALTER TABLE "User"
        ADD COLUMN "user_wallet_id" VARCHAR(255)
        `);

    await queryRunner.query(`
        ALTER TABLE "virtualAccount"
        ADD COLUMN "transaction_id" VARCHAR(255)
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "User"
    DROP COLUMN "settlement_acctount_id"
  `);

    await queryRunner.query(`
    ALTER TABLE "User"
    DROP COLUMN "user_wallet_id"
  `);

    await queryRunner.query(`
    ALTER TABLE "virtualAccount"
    DROP COLUMN "transaction_id"
  `);
  }
}
