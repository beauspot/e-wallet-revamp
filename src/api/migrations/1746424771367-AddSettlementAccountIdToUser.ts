import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSettlementAccountIdToUser1746424771367 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    ALTER TABLE "User"
    ADD COLUMN "settlement_account_id" uuid,
    ADD CONSTRAINT "FK_User_SettlementAcct" 
    FOREIGN KEY ("settlement_account_id") 
    REFERENCES "settlement"("id")
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "User"
      DROP CONSTRAINT "FK_User_SettlementAcct",
      DROP COLUMN "settlement_account_id"
    `);
  }
}
